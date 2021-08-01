"C:\Program Files\MongoDB\Server\5.0\bin\mongod.exe" --auth  --keyFile "C:/Program Files/MongoDB/Server/5.0/bin/mongodb.key" --port 2345 --dbpath "C:\data\haiku0" --logpath "C:\logs\haikuDB-port2345.log" --replSet "HaikuDB" --install

"C:\Program Files\MongoDB\Server\5.0\bin\mongod.exe" --auth  --keyFile "C:/Program Files/MongoDB/Server/5.0/bin/mongodb.key" --port 3456 --dbpath "C:\data\haiku0" --logpath "C:\logs\haikuDB-port3456.log" --replSet "HaikuDB" --install

"C:\Program Files\MongoDB\Server\5.0\bin\mongod.exe" --auth  --keyFile "C:/Program Files/MongoDB/Server/5.0/bin/mongodb.key" --port 4567 --dbpath "C:\data\haiku0" --logpath "C:\logs\haikuDB-port4567.log" --replSet "HaikuDB" --install

###################################################

pm2 start --name mdb0 mongod -- --dbpath C:/data/haiku0 --keyFile "C:/Program Files/MongoDB/Server/5.0/bin/mongodb.key" --port 2345 --logpath "C:\logs\haikuDB-port2345.log" --replSet "HaikuDB" --auth

pm2 start --name mdb1 mongod -- -dbpath C:/data/haiku1 -keyFile "C:/Program Files/MongoDB/Server/5.0/bin/mongodb.key" -port 3456 -logpath "C:\logs\haikuDB-port3456.log" --replSet "HaikuDB" -auth

pm2 start --name mdb2 mongod -- -dbpath C:/data/haiku2 -keyFile "C:/Program Files/MongoDB/Server/5.0/bin/mongodb.key" -port 4567 -logpath "C:\logs\haikuDB-port4567.log" --replSet "HaikuDB" -auth

pm2 start --name server index.js
