import json
import os
from typing import Dict, Any

class JsonDB:
    def __init__(self):
        self.data_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data")
        os.makedirs(self.data_dir, exist_ok=True)
    
    def _get_file_path(self, collection: str) -> str:
        return os.path.join(self.data_dir, f"{collection}.json")
    
    def read(self, collection: str) -> Dict[str, Any]:
        try:
            with open(self._get_file_path(collection), 'r', encoding='utf-8') as f:
                return json.load(f)
        except FileNotFoundError:
            return {}
    
    def write(self, collection: str, data: Dict[str, Any]) -> None:
        with open(self._get_file_path(collection), 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
