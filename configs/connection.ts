import * as mongodbEntities from 'app/entities/mongodb'
import * as mysqlEntities from 'app/entities/mysql'
import Environment from 'configs/environments'
import * as bootstrap from './bootstrap'
import { print } from './utils'
import { createConnections } from 'typeorm'
; (async () => {
    
    const connections = await createConnections([{
        name: 'mongodb',
        type: 'mongodb',
        host: Environment.MG_MY_HOST,
        port: Environment.MG_MY_PORT,
        username: Environment.MG_USERNAME,
        password: Environment.MG_PASSWORD,
        database: Environment.MG_DATABASE,
        useNewUrlParser: true,
        useUnifiedTopology: true,
        synchronize: true,
        entities: Object.keys(mongodbEntities).map(name => mongodbEntities[name])
    }, {
        name: 'mysql',
        type: 'mysql',
        host: Environment.MQ_MY_HOST,
        port: Environment.MQ_MY_PORT,
        username: Environment.MQ_USERNAME,
        password: Environment.MQ_PASSWORD,
        database: Environment.MQ_DATABASE,
        synchronize: true,
        entities: Object.keys(mysqlEntities).map(name => mysqlEntities[name])
    }])
    connections.forEach(con => {
        let name = con.options.name;
        if (con.isConnected) {
            print.log(name + ' database connected.')
        } else {
            print.danger(name + 'Database connection failed.')
        }
    })
    bootstrap.connected()
})().catch(error => console.log(error))
