let canvas = document.getElementById('myCanvas');
let replicaCanvas = document.getElementById('replicaCanvas');

//json 파일 생성 위한 코드
// fs모듈을 사용하기 위한 선언
// const fs = require('fs');
let jsonData = [];


//캔버스 요소의 2d 렌더링 컨텍스트 가져옴
let ctx = canvas.getContext('2d');
let replicaCtx = replicaCanvas.getContext('2d');

let startPosition = { x: 0, y: 0 } //맨 처음 시작한 위치 저장

let lastPoint = { x: 0, y: 0 }; //이전에 그린 지점의 좌표 저장
let strokeData = []; //각 그림의 스트로크 저장
let currentStroke = []; //현재 그리고 있는 스트로크의 좌표 저장

let timer = null; //스트로크 간의 간격 유지 위한 식별자

//마우스 버튼이 눌릴때 실행됨, 그리기 시작을 초기화 & 마우스 이동 이벤트 리스너 등록
canvas.onmousedown = (e) => {
    lastPoint = getMousePos(canvas, e);
    ctx.beginPath(); //새로운 그리기 경로 시작
    ctx.moveTo(lastPoint.x, lastPoint.y);

    timer = setInterval(() => {
        canvas.addEventListener('mousemove', draw);
    }, 200);

    currentStroke = [{...lastPoint, dx: 0, dy: 0}];
    updateSequentialData();
};

/*마우스 버튼이 놓였을 때 실행됨. 
그리기 종료, 현재 그린 스트로크를 strokeData에 추가하고, 
그림을 복제하는 drawReplicaCanvas 함수를 호출*/
canvas.onmouseup = () => {
    canvas.removeEventListener('mousemove', draw);
    clearInterval(timer);
    timer = null;
    strokeData.push(currentStroke);
    currentStroke = [];
    updateSequentialData();
    drawReplicaCanvas();
};

//마우스 이벤트 객체(e) & 캔버스 요소 사용하여 마우스 포인터의 좌표 계산
function getMousePos(canvas, e) {
    let rect = canvas.getBoundingClientRect(); //현재 요소 위치 찾기
    return { //캔버스 내의 상대적인 마우스 위치 계산
        x: Math.round(e.clientX - rect.left),
        y: Math.round(e.clientY - rect.top)
        /*마우스 이벤트 객체(e)의 clientX와 clientY 속성(뷰포트 기준 마우스 좌표)에서 
        캔버스 요소의 왼쪽 상단 모서리의 좌표를 빼줌*/
    };
}

//마우스 이동이 발생할 때마다 실행. 마우스 포인터의 현재 위치와 이전 위치 사이에 선 그림. 
//그린 좌표와 벡터를 currentStroke에 추가하고, 
//이벤트 정보를 업데이트하는 updateSequentialData 함수를 호출합니다.
function draw(e) {
    let currentPoint = getMousePos(canvas, e);
    let dx = currentPoint.x - lastPoint.x;
    let dy = currentPoint.y - lastPoint.y;
    ctx.lineTo(currentPoint.x, currentPoint.y); //이전위치에서 현재 위치까지 선 그리기
    ctx.stroke();

    lastPoint = currentPoint; //마지막 point를 현재 point로 업데이트
    currentStroke.push({...lastPoint, dx, dy});

    let currentPosBox = document.getElementById('currentPosBox');
    currentPosBox.innerHTML = `Current Position: (${currentPoint.x}, ${currentPoint.y}), Vector: (${dx}, ${dy})`;
    updateSequentialData();
}

//replicaCanvas에 그림 복제, strokeData 배열에 저장된 각 스트로크를 가져와 선 그림.
function drawReplicaCanvas() {
    replicaCtx.clearRect(0, 0, replicaCanvas.width, replicaCanvas.height);
    // let startPoint = getReplicaCanvasStartPoint(); //초기 위치변경
    // //{ x: replicaCanvas.width / 2, y: replicaCanvas.height / 2 }; 
    // let lastPoint = startPoint;

    strokeData.forEach((stroke) => {
        if (stroke.length === 0) {
            return;
        }

        let startPoint = { x: stroke[0].x, y: stroke[0].y };
        let lastPoint = startPoint;

        stroke.forEach((point, pointIndex) => {
            if (pointIndex === 0) {
                replicaCtx.beginPath();
                replicaCtx.moveTo(lastPoint.x, lastPoint.y);
            } else {
                lastPoint = { 
                    x: lastPoint.x + point.dx, 
                    y: lastPoint.y + point.dy }; //왜 10을 곱한거지?
                replicaCtx.lineTo(lastPoint.x, lastPoint.y);
            }
        });
        replicaCtx.stroke();
        lastPoint = startPoint;
    });
}

//맨 처음 위치를 최초의 위치로 설정. strokeData[0] => 쓸모없다
// function getReplicaCanvasStartPoint() {
//     if (strokeData.length > 0 && strokeData[0].length > 0) {
//         const firstPoint = strokeData[0][0];
//         return { x: firstPoint.x, y: firstPoint.y };
//     } else {
//         return { x: replicaCanvas.width / 2, y: replicaCanvas.height / 2 };
//     }
// }

// 캔버스를 지우고 strokeData 배열과 lastPoint를 초기화
function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    replicaCtx.clearRect(0, 0, replicaCanvas.width, replicaCanvas.height);
    strokeData = [];
    lastPoint = { x: 0, y: 0 };
    updateSequentialData();
}

//마지막으로 그린 스트로크를 되돌림. 
//strokeData 배열에서 마지막 스트로크 제거, 남은 스트로크로 다시 그림.
function undoStroke() {
    if (strokeData.length > 0) {
        strokeData.pop();
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        strokeData.forEach(stroke => {
            if (stroke.length === 0) {
                return;
            }
            ctx.beginPath();
            ctx.moveTo(stroke[0].x, stroke[0].y);
            for (let i = 1; i < stroke.length; i++) {
                ctx.lineTo(stroke[i].x, stroke[i].y);
            }
            ctx.stroke();
        });
        drawReplicaCanvas();
        updateSequentialData();
    }
}


//json 다운로드
function downloadJSONFile(data, filename) {
    const jsonData = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();

    URL.revokeObjectURL(url);
}


//strokeData 배열의 그림 정보를 순차적으로 업데이트하여 HTML 요소에 표시.
function updateSequentialData() {
    let sequentialDataBox = document.getElementById('sequentialData');
    sequentialDataBox.innerHTML = '';
    let eventLog = '';

    jsonData = []; // jsonData 초기화

    //정보 표시하는 부분입니다
    strokeData.forEach((stroke, index) => {
        stroke.forEach((point, i) => {
            eventLog = 
            `Event ${index * 1000 + i}: x=${point.x}, y=${point.y}, 
            Vector: (${point.dx}, ${point.dy})<br>` + eventLog;

            //json 데이터 생성
            let eventData = {
                x: point.x,
                y: point.y,
                vector: { dx: point.dx, dy: point.dy }
            }

            jsonData.push(eventData); // JSON 데이터 배열에 추가

        });
    });
    sequentialDataBox.innerHTML = eventLog;
    sequentialDataBox.scrollTop = 0;
}

// json 파일 다운로드
document.getElementById('downloadButton').addEventListener('click', () => {
    downloadJSONFile(jsonData, 'data.json');
});

console.log(jsonData)