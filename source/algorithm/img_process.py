import os
import json
import cv2
import numpy as np
from matplotlib import pyplot as plt

class ImageProcess:
    def __init__(self, img_path):
        self.img_path = img_path
        self.img = cv2.imread(self.img_path, 0)

    def canny_edge(self):
        return cv2.Canny(self.img, 50, 150) # 캐니앳지 적용. 1, 2번 인자는 감도

    def find_max_contour(self): # 테두리 찾는 함수. 가장 긴 라인을 테두리로 정의
        cannyed = self.canny_edge() # 캐니 엣지 적용된 그림을 받아온다.
        contours, _ = cv2.findContours(cannyed, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE) # 모든 라인마다 길이 정보를 정의 및 저장
        return max(contours, key = cv2.contourArea) # 가장 긴 길이의 선을 컨투어로 정의.

    def draw_contour(self): # 테두리 정보만을 가진 그림을 생성
        tmp = self.find_max_contour()  # find_max_contour 에서 전달 받은 데이터를 저장
        processed_img = np.zeros_like(self.img)
        return cv2.drawContours(processed_img, [tmp], 0, (255, 255, 255), 1) # 새로운 그림 생성

    def save_img(self, processed_img):
        filename, file_extension = os.path.splitext(self.img_path)
        output_path = f"{filename}_processed{file_extension}"
        cv2.imwrite(output_path, processed_img)


class Dataization:
    def __init__(self, img, img_path):
        self.img = img
        self.img_path = img_path

    def find_coordinates(self):
        points = np.where(self.img != 0) # 이미지의 0이 아닌 (dot가 유효한) 포인트를 저장
        coordinates = list(zip(points[1], points[0])) # 리스트에 좌표값 저장
        start = min(coordinates, key=lambda x: x[0]) # 가장 0에 가까운 x축이 그림의 시작점으로 정의
        sorted_coordinates = sorted(coordinates, key=lambda x: (
        -np.arctan2(x[1] - start[1], x[0] - start[0]), -np.hypot(x[1] - start[1], x[0] - start[0]))) # 좌표값 정렬
        return sorted_coordinates

    def create_dataized(self, sorted_coordinates):
        dataized = []
        min_coord = np.min(sorted_coordinates, axis=0)
        max_coord = np.max(sorted_coordinates, axis=0)
        for i in range(len(sorted_coordinates)):
            normalized_coord = (sorted_coordinates[i] - min_coord) / (max_coord - min_coord)
            if i == 0:
                dataized.append({'relative_coordinate': (0, 0), 'unit_direction_vector': (0, 0)})
            else:
                diff = np.subtract(normalized_coord, dataized[-1]['relative_coordinate'])
                magnitude = np.linalg.norm(diff)
                unit_direction_vector = tuple(diff / magnitude if magnitude else 0)
                dataized.append(
                    {'relative_coordinate': normalized_coord.tolist(), 'unit_direction_vector': unit_direction_vector})
        return dataized

    def save_to_json(self, dataized):
        output_name = self.img_path.replace('.png', '_dataized.json')
        with open(output_name, 'w') as f:
            json.dump(dataized, f)

    def edge_extract(self):
        sorted_coordinates = self.find_coordinates()
        dataized = self.create_dataized(sorted_coordinates)
        self.save_to_json(dataized)
        return dataized



class Draw_with_Vector:
    def __init__(self, dataization, img_path):
        self.dataization = dataization
        self.img_path = img_path

    def draw(self):
        vec_data = self.dataization.edge_extract()
        coordinates = [point['relative_coordinate'] for point in vec_data]
        x_values = [coord[0] for coord in coordinates]
        y_values = [coord[1] for coord in coordinates]
        # plt.plot(x_values, y_values)
        plt.scatter(x_values, y_values)
        plt.gca().invert_yaxis()
        plt.show()

    def save_img(self):
        vec_data = self.dataization.edge_extract()
        coordinates = [point['relative_coordinate'] for point in vec_data]
        x_values = [coord[0] for coord in coordinates]
        y_values = [coord[1] for coord in coordinates]
        plt.scatter(x_values, y_values)
        plt.gca().invert_yaxis()
        filename, file_extension = os.path.splitext(self.img_path)
        output_path = f"{filename}_drowed.png"
        plt.savefig(output_path)