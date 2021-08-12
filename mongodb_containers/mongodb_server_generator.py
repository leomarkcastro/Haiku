import yaml
import json
import os

# Get the following : mongodb_cluster_name, <amount of cluster>
mongodb_name = input("Name of MongoDB Instance Database: ").strip().replace(' ', '__')
mongodb_port = input("Port of MongoDB Instance: ").strip().replace(' ', '__')

cluster_name = input("Name of MongoDB Cluster: ").strip().replace(' ', '__')
cluster_amount = int(input("Amount of MongoDB Cluster(s) [Min 1 || Max 7]: ").strip())

bin_name = input("Name of MongoDB Cluster First Bin: ").strip().replace(' ', '__')
bin_user = input("Name of MongoDB Cluster Bin Username: ").strip().replace(' ', '__')
bin_pass = input("Name of MongoDB Cluster Bin Password: ").strip().replace(' ', '__')

cluster_network = f"{mongodb_name}-network"
output_location = f"./{mongodb_name}_output"

# Create folder
if not os.path.exists(output_location):
    os.makedirs(output_location)

# Generate Docker Compose File

compose_setup = {
    'version': '3.0', 

    'volumes': {
        f'{mongodb_name}-keys': None, 
        **{
            f"{mongodb_name}-data-{i}": None for i in range(cluster_amount)
        }
    }, 

    'networks': {
        cluster_network: {
            'driver': 'bridge', 
            #'ipam': {
            #    'driver': 'default', 
            #    'config': [
            #        {'subnet': '172.10.5.0/24'}
            #    ]
            #}
        }
    }, 

    'services': {
        f'{mongodb_name}-keys': {
            'image': 'depop/openssl-bats', 
            'volumes': [f'{mongodb_name}-keys:/mongo-conf'], 
            'command': 'bash -c "openssl rand -base64 741 > /mongo-conf/mongodb-keyfile; chmod 600 /mongo-conf/mongodb-keyfile; chown 999 /mongo-conf/mongodb-keyfile"'
        }, 
        
        f'{mongodb_name}-primary': {
            'image': 'mongo:latest', 
            'volumes': [
                f'{mongodb_name}-keys:/opt/keyfile', 
                f'{mongodb_name}-data-0:/data/db'
                ], 
            'env_file': './mongod.env', 
            'ports': [f'{mongodb_port}:27017'], 
            'stdin_open': False, 
            'command': f'mongod --auth --keyFile /opt/keyfile/mongodb-keyfile --replSet {cluster_name}', 
            'depends_on': [
                f'{mongodb_name}-keys'
            ], 
            'networks': {
                cluster_network: None
            }
        }, 
        
        **{f'{mongodb_name}-worker-{i+1}': {
            'image': 'mongo:latest', 
            'volumes': [
                f'{mongodb_name}-keys:/opt/keyfile', 
                f'{mongodb_name}-data-{i+1}:/data/db'
            ], 
            'env_file': './mongod.env', 
            'stdin_open': False, 
            'command': f'mongod --auth --keyFile /opt/keyfile/mongodb-keyfile --replSet {cluster_name}', 
            'depends_on': [
                f'{mongodb_name}-keys',
                f'{mongodb_name}-primary', 
            ], 
            'networks': {
                cluster_network: None
            }
        } for i in range(cluster_amount-1)}, 

    }
}

with open(f"{output_location}/docker-compose.yaml", 'w+') as f:
    try:
        yaml.safe_dump(compose_setup, f)
        print("> Succesfully Generated A Docker Compose File")
    except yaml.YAMLError as exc:
        print(exc)


# Write the mongod.env File
with open(f"{output_location}/mongod.env", 'w+') as f:
    try:
        print("MONGO_INITDB_ROOT_USERNAME=root\nMONGO_INITDB_ROOT_PASSWORD=password", file=f)
        print("> Succesfully Generated [mongod.env]")
    except yaml.YAMLError as exc:
        print(exc)

# Write the makefile
with open(f"{output_location}/Makefile", 'w+') as f:
    try:
        print("build-docker:\n\tdocker-compose up\n\ndestroy-docker:\n\tdocker-compose down", file=f)
        print("> Succesfully Generated [Makefile]")
    except yaml.YAMLError as exc:
        print(exc)

# Generate Commands
with open(f"{output_location}/todo.txt", 'w+') as f:

    members = json.dumps(
        {
            "_id" : cluster_name,
            "members" : [
                {"_id" : 0,"host" : f"{mongodb_name}-primary:27017"},
            ] + [
                {"_id" : i+1,"host" : f"{mongodb_name}-worker-{i+1}"} 
                for i in range(cluster_amount-1) 
            ]
        }
    )

    adminUser = json.dumps(
        {
            "user": "cluster_admin",
            "pwd": "password",
            "roles": [ 
                { "role": "userAdminAnyDatabase", "db": "admin" },  
                { "role" : "clusterAdmin", "db" : "admin" } 
            ]
        }
    )

    newUser = json.dumps(
        {
            "user": bin_user,
            "pwd": bin_pass,
            "roles": [ 
                { "role": "readWrite", "db": bin_name } 
            ]
        }
    )

    x = f"""
        --------------------------------------------------------
        Type this on the console:

        docker-compose up -d

        docker-compose exec {mongodb_name}-primary mongo -u "root" -p "password"

        --------------------------------------------------------
        Type this on mongosh:
        rs.initiate({members});

        # Wait for the current mongodb to be Primary, else the command below might fail
        conf = rs.config();
        conf.members[0].priority = 2;
        rs.reconfig(conf);

        use admin;
        db.createUser({adminUser});
        db.auth("cluster_admin", "password");

        use {bin_name};
        db.createUser({newUser});

        --------------------------------------------------------

        To Log In mongosh:
        docker-compose exec {mongodb_name}-primary mongo -u "{bin_user}" -p "{bin_pass}" --authenticationDatabase {bin_name}

        --------------------------------------------------------

        To Use In Scripts:
        mongodb://{bin_user}:{bin_pass}@localhost:{mongodb_port}/{bin_name}?authSource={bin_name}&replicaSet={cluster_name}&readPreference=primary&directConnection=true&ssl=false

        Link : mongodb://{bin_user}:{bin_pass}@localhost:{mongodb_port}
        Collection: {bin_name}
        Settings: authSource={bin_name}&replicaSet={cluster_name}&readPreference=primary&directConnection=true&ssl=false

        --------------------------------------------------------

    """
    print(x.replace("        ",""), file=f)
    print("> Succesfully Generated [todo.txt]")



