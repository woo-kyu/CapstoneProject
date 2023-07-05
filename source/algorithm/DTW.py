import json
import numpy as np
from fastdtw import fastdtw
from scipy.spatial.distance import euclidean
from sklearn.preprocessing import MinMaxScaler

class DTWComparator:
    def __init__(self):
        self.ref_data = None
        self.comp_data = None

    def load_ref_data(self, json_file_path):
        with open(json_file_path, 'r') as f:
            data = json.load(f)
        self.ref_data = np.array([[d['relative_coordinate'], d['unit_direction_vector']] for d in data])
        self.ref_data = self.normalize_data(self.ref_data)

    def load_comp_data(self, json_file_path):
        with open(json_file_path, 'r') as f:
            data = json.load(f)
        self.comp_data = np.array([[d['relative_coordinate'], d['unit_direction_vector']] for d in data])
        self.comp_data = self.normalize_data(self.comp_data)

    def normalize_data(self, data):
        scaler = MinMaxScaler()
        return scaler.fit_transform(data)

    def compute_dtw(self):
        if self.ref_data is None or self.comp_data is None:
            raise ValueError("Both reference data and comparison data should be loaded before computing DTW.")

        distance, path = fastdtw(self.ref_data, self.comp_data, dist=euclidean)
        return distance, path

    def report_result(self):
        distance, path = self.compute_dtw()
        print("DTW distance is:", distance)
        print("DTW path is:", path)


