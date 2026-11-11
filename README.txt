# Radar Motorista — protótipo 0.1

## O que esta versão faz
- Permite escolher Vinhedo, Valinhos, Louveira e Campinas.
- Consulta condições meteorológicas atuais e previsão horária via Open-Meteo.
- Calcula um **indicador experimental** usando horário, dia da semana e sinais de chuva.
- Exibe mapa com OpenStreetMap.
- Atualiza a cada 10 minutos enquanto a página está aberta.
- Permite solicitar permissão de notificação no navegador.

## Limitações importantes
- A pontuação não mede pedidos reais da Uber/99, não é uma previsão validada e não garante corridas ou ganhos.
- Trânsito e eventos ainda não estão integrados.
- A notificação local só é acionada enquanto a página está ativa. Para alertas confiáveis com o app fechado, é necessário hospedar o app e implementar servidor de push (por exemplo, Firebase Cloud Messaging), cadastro de dispositivos e rotina de análise na nuvem.
- O protótipo precisa ser servido por HTTPS para instalação PWA e recursos de service worker.
- Open-Meteo: uso gratuito da API pública é voltado a uso não comercial; para produto comercial, contratar plano ou hospedar solução compatível. Exige atribuição CC BY 4.0.
- Respeitar termos de uso e atribuição do OpenStreetMap.

## Como testar no Android
1. Hospede os arquivos em um serviço HTTPS (por exemplo, Firebase Hosting, GitHub Pages ou outro host estático).
2. Abra o endereço no Chrome do Android.
3. Menu ⋮ > **Instalar app** ou **Adicionar à tela inicial**.
4. Abra pelo ícone instalado e permita notificações para testar alertas enquanto estiver em uso.

## Próximas etapas técnicas
1. Criar backend seguro e armazenamento de observações reais dos motoristas, com consentimento.
2. Integrar API de trânsito com chave protegida no servidor (TomTom ou alternativa).
3. Integrar fontes de eventos e calendário público.
4. Criar modelo de previsão calibrado com resultados reais e medir precisão.
5. Integrar Firebase Cloud Messaging para push quando o app estiver fechado.
6. Criar painel de qualidade dos dados e evitar alertas sem evidência.

## Créditos
- Meteorologia: Open-Meteo (CC BY 4.0).
- Mapa: © OpenStreetMap contributors.
- Não afiliado à Uber ou à 99.
