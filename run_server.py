from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
import webbrowser
import os

PORT = 8000
os.chdir(os.path.dirname(os.path.abspath(__file__)))
server = ThreadingHTTPServer(('localhost', PORT), SimpleHTTPRequestHandler)
url = f'http://localhost:{PORT}'
print(f'Museum Virtual berjalan di {url}')
print('Tekan CTRL+C untuk menghentikan server.')
webbrowser.open(url)
server.serve_forever()
