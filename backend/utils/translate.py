# translate.py
from deep_translator import GoogleTranslator
import sys
import json

def translate_to_marathi(text):
    try:
        return GoogleTranslator(source='en', target='mr').translate(text)
    except Exception as e:
        return str(e)

if __name__ == "__main__":
    input_json = sys.argv[1]
    data = json.loads(input_json)
    nameEr = data.get("nameEr", "")
    description = data.get("description", "")

    output = {
        "nameMr": translate_to_marathi(nameEr),
        "descriptionMR": translate_to_marathi(description)
    }

    print(json.dumps(output))  # ONLY print this line
