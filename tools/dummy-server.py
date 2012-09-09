#!/usr/bin/python
#
# Dummy HTTP server
#

import string,time,json
from BaseHTTPServer import BaseHTTPRequestHandler, HTTPServer

class MyHandler(BaseHTTPRequestHandler):

    def do_GET(self):
        try:
            self.send_response(200)
            self.send_header('Content-type',	'text/html')
            self.end_headers()
            self.wfile.write("Hello\n")
            return
                
        except:
            self.send_error(404,'File Not Found: %s' % self.path)
     

    def do_POST(self):
        try:
            pd = self.rfile.read(int(self.headers['Content-Length']))
            self.send_response(200)
            self.send_header('Content-type', 'application/json;charset=UTF-8')
            self.end_headers()
            if self.path == '/activate':
                data = json.loads(pd)
                code = data['code']
                hwid = data['hwid']
                if code == '233419911426520' and hwid!=None: # testing activation code '233 419 911 426 520'
                    print 'HardWare IDentifier: [%s]' % (hwid)
                    self.wfile.write('{"status":"OK", "account":"kcome@720browser.com", "token":"kcome-is-233"}')
                else:
                    self.wfile.write('{"status":"Error"}')
                return
            elif self.path == '/auth':
                data = json.loads(pd)
                token = data['token']
                hwid = data['hwid']
                if token == 'kcome-is-233' and hwid!=None:
                    self.wfile.write('{"status":"OK", "unix_name":"kcome", "unix_password":"kcome233"}')
                else:
                    self.wfile.write('{"status":"Error"}')
                return

            # default
            self.send_response(404)
            self.end_headers()
            self.wfile.write('{"status":"Not found"}')
            
        except:
            self.send_response(500)
            self.end_headers()
            self.wfile.write('{"status":"Exception"}')
            pass

def main():
    try:
        server = HTTPServer(('', 8080), MyHandler)
        print 'started httpserver...'
        server.serve_forever()
    except KeyboardInterrupt:
        print '^C received, shutting down server'
        server.socket.close()

if __name__ == '__main__':
    main()

