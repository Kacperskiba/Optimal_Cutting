Dobra to tak:

Backend ---> FastAPI

Frontend ---> React powinno być proste coś sie wygeneruje

Mamy do zrobienia te cięcie płyt, algorytmy można z biblioterki gotowej posprawdzać albo poszponcic z własnym jakimś tam są w miare nie najgorsze. Zawsze beda heurystyczne i musza mieć logike ogarnieta.
Typu żeby dały możliwość cięcia w jednej linii itd.
Parametry jakie bierzemy na początek pod uwagę:
- dlugość i szerokość naszej płyty
- szerokość piły w mm wszystko będzie najpewniej żeby to wszystko ujednolicić
- nie przewiduje wiecej ale moze sie dopytam niedługo

Dobra głownie będzie apka działać bedzie tak:

User daje info potrzebne ---> UI przyjmuje dane i wdupca w JSONa ---> Wysyłamy do FastAPI ---> probujemy asyncha użyć ale zobaczymy żeby była responsywna w miarę apka ---> algortytm dane wywala JSON leci na strone
---> fajny interfejs mozesz kliknąć element i ci jego wymiary może wypisać, kolorki dla różnych elementów
jak narazie mam tyle ale pewnie coś się przemyśli z wymiarami juz od buta wybieranymi, jakieś popularne żeby nie wpisywać ciągle.


jak juz sb tego remote dodasz gita w IDE to terminalu:

cd backend

python -m venv venv

venv\Scripts\activate

pip install fastapi uvicorn

cd ..

npm create vite@latest frontend -- --template react 

Jeśli zapyta o instalację pakietu create-vite, to y

cd frontend

npm install
