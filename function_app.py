import azure.functions as func
import requests
import os
import json

app = func.FunctionApp(http_auth_level=func.AuthLevel.ANONYMOUS)

@app.route(route="clima")
def GetWeather(req: func.HttpRequest) -> func.HttpResponse:
    city = req.params.get('city')
    # No futuro, essa chave virá do Azure Key Vault
    api_key = os.environ.get("OPENWEATHER_KEY")
    
    if not city:
        return func.HttpResponse("Por favor, passe o nome de uma cidade. Ex: ?city=Curitiba", status_code=400)

    url = f"https://api.openweathermap.org/data/2.5/weather?q={city}&appid={api_key}&units=metric&lang=pt_br"
    response = requests.get(url)
    
    if response.status_code == 200:
        data = response.json()
        temp = data['main']['temp']
        desc = data['weather'][0]['description']
        
        # Lógica personalizada (O "brilho" do seu projeto)
        message = "Dia lindo! Aproveite."
        if temp < 15: message = "Está frio, melhor levar um casaco!"
        elif "chuva" in desc: message = "Não esqueça o guarda-chuva!"

        result = {
            "cidade": city,
            "temperatura": f"{temp}°C",
            "condicao": desc,
            "dica": message
        }
        
        return func.HttpResponse(json.dumps(result), mimetype="application/json")
    
    return func.HttpResponse("Erro ao buscar clima.", status_code=500)