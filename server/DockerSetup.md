# Docker Tutorial 12

Mongo cluster, deploying a ReplicaSet

### To run the cluster:
```
docker-compose up
```

### Connect to the primary node
```
docker-compose exec haikuDB-mongo-primary mongo -u "root" -p "password"
```

### Instantiate the replica set
```
rs.initiate({"_id" : "haikuDB-replica-set","members" : [{"_id" : 0,"host" : "haikuDB-mongo-primary:27017"},{"_id" : 1,"host" : "haikuDB-mongo-worker-1:27017"},{"_id" : 2,"host" : "haikuDB-mongo-worker-2:27017"}]});
```

### Set the priority of the master over the other nodes
```
conf = rs.config();
conf.members[0].priority = 2;
rs.reconfig(conf);
```

### Create a cluster admin
```
use admin;
db.createUser({user: "cluster_admin",pwd: "password",roles: [ { role: "userAdminAnyDatabase", db: "admin" },  { "role" : "clusterAdmin", "db" : "admin" } ]});
db.auth("cluster_admin", "password");
```

### Create a collection on a database
```
use haikuDB;
db.createUser({user: "haikuDB",pwd: "haikuDBpass",roles: [ { role: "readWrite", db: "haikuDB" } ]});
```

### Verify credentials
```
docker-compose exec haikuDB-mongo-primary mongo -u "haikuDB" -p "haikuDBpass" --authenticationDatabase "haikuDB"

**Express Connection String**
mongodb://haikuDB:haikuDBpass@haikuDB-mongo-primary:27017,haikuDB-mongo-worker-1:27017,haikuDB-mongo-worker-2:27017/haikuDB?authSource=haikuDB&replicaSet=haikuDB-replica-set&readPreference=primary

**MongoCompass Compatible**
mongodb://haikuDB:haikuDBpass@localhost:2345/haikuDB?authSource=haikuDB&replicaSet=haikuDB-replica-set&readPreference=primary&appname=MongoDB%20Compass&directConnection=true&ssl=false

```

### Destory the cluster
```
docker-compose down
```