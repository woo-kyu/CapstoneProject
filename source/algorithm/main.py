from img_process import *

def function(img_path):
    p1 = ImageProcess(img_path)
    p1_processed = p1.draw_contour()
    p1.save_img(p1_processed)

    p2 = Dataization(p1_processed, img_path)
    p2.edge_extract()

    p3 = Draw_with_Vector(p2, img_path)
    p3.save_img()


if __name__ == "__main__":
    img_name = 'Source/b/b.jpg'
    function(img_name)