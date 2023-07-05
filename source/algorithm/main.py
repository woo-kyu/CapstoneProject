from img_process import *
import DTW

def function(img_path):
    p1 = ImageProcess(img_path)
    p1_processed = p1.draw_contour()
    p1.save_img(p1_processed)

    p2 = Dataization(p1_processed, img_path)
    p2.edge_extract()

    p3 = Draw_with_Vector(p2, img_path)
    p3.save_img()

def dtw(json_file_path1, json_file_path2):
    dtw = DTW.DTWComparator()
    dtw.load_ref_data(json_file_path1)
    dtw.load_comp_data(json_file_path2)
    dtw.report_result()


if __name__ == "__main__":
    img_name = 'Source/a/a.png'
    function(img_name)