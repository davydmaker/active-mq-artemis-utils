/**
 * @author Davyd Maker <contato@davydmaker.com.br>
 * @version 1.0
 * @description Script para limpar e resetar filas no painel AMQ7 Broker Console do Artemis
 * @date 2021-08-25
 */

if (window.location.href.indexOf("auth/login") > -1) throw 'É necessário estar logado para executar as operações.';

operationsQueue = ['enable', 'flushExecutor', 'removeAllMessages', 
'resetAllGroups', 'resetMessageCounter', 'resetMessagesAcknowledged', 
'resetMessagesAdded', 'resetMessagesExpired', 'resetMessagesKilled'];
operationsAddress = ['clearDuplicateIdCache', 'resume'];

queues = prompt("Informe o endereço completo da fila:");
queues = queues.replaceAll(/\s/g,'').split(",");

user = window.location.href.split("root-org.apache.activemq.artemis-")[1].split("-").splice(0, 3).join("-");
host = window.location.href.split("/").splice(0, 3).join("/");

urlAddress = `/console/jolokia/exec/org.apache.activemq.artemis:broker=!%22${user}!%22,component=addresses,address=!%22{queue}!%22/{operation}()`;
urlQueue = `/console/jolokia/exec/org.apache.activemq.artemis:broker=!%22${user}!%22,component=addresses,address=!%22{queue}!%22,subcomponent=queues,routing-type=!%22anycast!%22,queue=!%22{queue}!%22/{operation}()`;

queues.forEach(async (queue) => {
    for (const operation of operationsQueue) {
        let url = urlQueue.replace("{operation}", operation).replaceAll("{queue}", queue);
        try {
            const response = await fetch(url);
            const data = await response.json();
            console.log(`Queue: ${queue} - ${operation}() - ${data.status}`);
        } catch (error) {
            console.error(`Error executing operation on queue ${queue}: ${error}`);
        }
    }
    for (const operation of operationsAddress) {
        let url = urlAddress.replace("{operation}", operation).replaceAll("{queue}", queue);
        try {
            const response = await fetch(url);
            const data = await response.json();
            console.log(`Address: ${queue} - ${operation}() - ${data.status}`);
        } catch (error) {
            console.error(`Error executing operation on address ${queue}: ${error}`);
        }
    }
});
