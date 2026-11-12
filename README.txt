# Radar Motorista — protótipo 0.1

## O que esta versão faz
- Permite escolher Vinhedo, Valinhos, Louveira e Campinas.
- Consulta condições meteorológicas atuais e previsão horária via Open-Meteo.
- Calcula um **indicador experimental** usando horário, dia da semana e sinais de chuva.
- Permite registrar manualmente o nível de demanda observado no mapa de calor do Uber Driver (baixa, moderada ou alta).
- Salva a última observação por cidade neste aparelho; ela influencia o indicador por até 90 minutos.
- Exibe mapa com OpenStreetMap.
- Atualiza a cada 10 minutos enquanto a página está aberta.
- Permite solicitar permissão de notificação no navegador.

## Limitações importantes
- A pontuação não mede pedidos reais da Uber/99, não é uma previsão validada e não garante corridas ou ganhos.
- O registro do mapa de calor é manual: o Radar não acessa nem extrai dados internos do aplicativo Uber. As observações ficam somente no armazenamento local deste aparelho e não são compartilhadas entre motoristas.
- Inclui atalho para visualizar o trânsito ao vivo no Google Maps, centralizado na cidade selecionada.
- Inclui acesso direto à agenda oficial de eventos da Prefeitura de Vinhedo.
- Trânsito e eventos ainda não são incorporados automaticamente à pontuação nem disparam alertas; esses atalhos abrem as fontes externas.
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
2. Integrar API de trânsito com chave protegida no servidor (TomTom ou alternativa), para ler congestionamentos automaticamente.
3. Consumir automaticamente a agenda oficial de Vinhedo e outras fontes públicas de eventos.
4. Criar modelo de previsão calibrado com resultados reais e medir precisão.
5. Integrar Firebase Cloud Messaging para push quando o app estiver fechado.
6. Criar painel de qualidade dos dados e evitar alertas sem evidência.

## Créditos
- Meteorologia: Open-Meteo (CC BY 4.0).
- Mapa: © OpenStreetMap contributors.
- Não afiliado à Uber ou à 99.


Padrão local de horário informado pelo motorista: em Vinhedo, maior demanda percebida durante a semana entre 06:00 e 08:30. O indicador experimental considera essa janela com peso adicional. É uma observação inicial do motorista, não uma medição oficial nem uma garantia de demanda.

Atualização do padrão local de Vinhedo em dias úteis: pico principal entre 06:00 e 08:30; queda após 09:00 até 11:30; melhora entre 11:30 e 14:00. O indicador usa pesos experimentais para representar essas observações, que devem ser validadas com novos registros ao longo do tempo.

Complemento do padrão local de Vinhedo em dias úteis: demanda fraca das 14:00 às 15:40; melhora a partir das 16:00, mantendo-se até 19:00. Pesos experimentais no indicador: -12 pontos no período fraco e +18 pontos na recuperação vespertina.

Complemento do padrão local de Vinhedo em dias úteis: das 19:00 até 00:00 a demanda permanece moderada. O indicador atribui um peso intermediário (+8 pontos) a essa faixa, como hipótese inicial baseada na observação do motorista.


## Padrões locais iniciais de Vinhedo
- Dias úteis: observações do motorista indicam pico das 06:00 às 08:30, queda após 09:00, melhora das 11:30 às 14:00, período fraco das 14:00 às 15:40, recuperação a partir das 16:00 e demanda moderada das 19:00 à meia-noite.
- Sábados: do dia 1 ao dia 15 costumam ser mais fortes; após o dia 15 costumam ficar mais fracos. Os horários variam, portanto o indicador não presume um pico fixo.
- Esses ajustes são heurísticas iniciais baseadas no relato de um motorista, não estatísticas da Uber/99 nem previsão validada. Devem ser calibrados com observações registradas ao longo do tempo.

- Domingos: segundo o relato do motorista, o movimento costuma ser melhor à tarde (12h às 18h) quando faz calor; com frio e chuva, costuma ser fraco. O indicador usa limites experimentais iniciais (calor a partir de 25 °C; frio até 18 °C combinado com chuva/probabilidade alta), que deverão ser ajustados com observações reais.


## Atualização — painel regional dos cinco sinais
- O painel compara automaticamente Vinhedo, Valinhos, Louveira e Campinas com consultas meteorológicas Open-Meteo, atualizadas a cada 10 minutos enquanto o app está aberto.
- A pontuação regional combina clima atual/previsão, padrões horários iniciais e observações locais registradas pelo motorista.
- As observações manuais são mantidas no aparelho e formam um histórico local de até 500 registros; a influência histórica considera os últimos 30 dias.
- A agenda de Vinhedo e Valinhos está disponível por links oficiais para consulta. Eventos ainda não são extraídos automaticamente nem pontuam.
- O trânsito continua com link para o Google Maps. Para dados automáticos de fluxo/incidentes, a documentação da TomTom confirma cobertura no Brasil e exige chave de API; a chave não deve ser exposta no HTML público. É necessário backend seguro para essa integração.
- A comparação entre cidades não é uma medição de pedidos Uber/99. Cidades sem observações próprias usam apenas padrões horários genéricos, e os dados de trânsito/eventos não são considerados na pontuação até existir integração automática verificável.


## Integração TomTom — preparação do backend
- A cobertura oficial da TomTom inclui Brasil para Traffic Flow e Traffic Incidents. O Radar vai começar pelos incidentes/congestionamentos próximos ao motorista; isso não deve ser confundido com uma medição completa de velocidade de todas as ruas.
- O endpoint seguro está preparado em `cloudflare-worker.js`. Ele consulta incidentes presentes em um raio configurável (padrão 5 km), resume congestionamentos/acidentes/obras e mantém cache compartilhado de 5 minutos para reduzir consumo.
- A chave deve ser cadastrada no Cloudflare como **Worker Secret** com o nome `TOMTOM_API_KEY`. Nunca inserir a chave no HTML, JavaScript público, README ou commit.
- O Worker ainda precisa ser implantado no Cloudflare e receber a chave secreta antes de o aplicativo poder consultá-lo. Depois será configurada a URL pública do Worker no app.
- A tabela oficial da TomTom informa atualmente franquias mensais gratuitas por API: Traffic Incidents Details 2.500 chamadas/mês e Traffic Flow Segment Data 20.000 chamadas/mês. Limites e preços podem mudar; monitorar consumo no painel TomTom antes de liberar para muitos usuários.
- Documentação: https://docs.tomtom.com/traffic-api/documentation/tomtom-orbis-maps/v2/product-information/introduction ; https://docs.tomtom.com/traffic-api/documentation/tomtom-orbis-maps/v2/traffic-incidents/incident-details ; https://docs.tomtom.com/pricing
- Este primeiro endpoint entrega ocorrências, não fluxo completo de velocidades. A pontuação do Radar só deve usar esses sinais depois de o backend estar implantado e os resultados serem validados.
