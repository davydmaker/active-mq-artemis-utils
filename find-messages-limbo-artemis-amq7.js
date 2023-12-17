/**
 * @author Davyd Maker <contato@davydmaker.com.br>
 * @version 1.0
 * @description Script para verificar se filas tem mensagens no limbo (constam mensagens e não há consumidores) no painel AMQ7 Broker Console do Artemis
 * @date 2021-08-25
 */

if (window.location.href.indexOf("auth/login") > -1) throw 'É necessário estar logado para executar as operações.';

const queues = [''];

if (queues.length === 0) {
    const input = prompt("Informe o endereço completo da fila:");
    queues = input.replaceAll(/\s/g,'').split(",");
}

const user = window.location.href.split("root-org.apache.activemq.artemis-")[1].split("-").splice(0, 3).join("-");
const host = window.location.href.split("/").splice(0, 3).join("/");

const url = `/console/jolokia/exec/org.apache.activemq.artemis:broker=!%22${user}!%22,component=addresses,address=!%22{queue}!%22,subcomponent=queues,routing-type=!%22anycast!%22,queue=!%22{queue}!%22/{operation}()`;

queues.forEach(async (queue) => {
    try {
        const urlCountMessages = url.replaceAll("{queue}", queue).replaceAll("{operation}", "countMessages");
        const responseCountMessages = await fetch(urlCountMessages);
        const dataCountMessages = await responseCountMessages.json();

        if (responseCountMessages.status !== 200) {
            console.error(`Fila: ${queue} - Não foi possível buscar quantidade de mensagens na fila.`);
            return;
        }
        const messagesCount = dataCountMessages.value;

        if (messagesCount > 0) {
            const urlCountConsumers = url.replaceAll("{queue}", queue).replaceAll("{operation}", "listConsumersAsJSON");
            const responseCountConsumers = await fetch(urlCountConsumers);
            const dataCountConsumers = await responseCountConsumers.json();

            if (responseCountConsumers.status !== 200) {
                console.error(`Fila: ${queue} - Quantidade de Mensagens: ${messagesCount} - Não foi possível buscar quantidade de consumidores na fila.`);
                return;
            }
            const consumersCount = JSON.parse(dataCountConsumers.value).length;

            if (consumersCount <= 0) {
                console.warn(`Fila: ${queue} - Quantidade de Mensagens: ${messagesCount} - Há mensagens nesta fila que estão no limbo.`);
            } else {
                console.log(`Fila: ${queue} - Quantidade de Mensagens: ${messagesCount} - Quantidade de Consumidores: ${consumersCount}`);
            }
        } else {
            console.log(`Fila: ${queue} - Não há mensagens na fila.`);
        }
    } catch (error) {
        console.error(`Erro ao processar a fila ${queue}: ${error}`);
    }
});
