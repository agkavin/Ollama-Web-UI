import ollama

class ModelList:
    def __init__(self):
        self.model_list = ollama.list()
        self.model_names = [model.model for model in self.model_list.models]

    def get_names(self):
        return self.model_names
    
mode = ModelList()
print(mode.get_names())
