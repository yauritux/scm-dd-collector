const core = require('@actions/core');
const axios = require('axios');

async function bootstrap() {
  try {
    const sonarUrl = core.getInput('sonar-base-url');
    const ddUrl = core.getInput('datadog-base-url');
    const component = core.getInput('component-name');
    const metricNames = core.getInput('metric-names');
    const metricType = core.getInput('metric-type');
    const metricUnit = core.getInput('metric-unit');
    const ddApikey = core.getInput('dd-api-key');
    const ddApplicationKey = core.getInput('dd-application-key');
    const sonarResponse = await axios.get(`${sonarUrl}/api/measures/component?component=${component}&metricKeys=${metricNames}`)
    console.log(JSON.stringify(sonarResponse.data, null, 2));
    const pattern = /[-$.+#)]/g;
    const payloadSeries = [];
    sonarResponse.data.component.measures.forEach(record => {
      payloadSeries.push({
        "metric": sonarResponse.data.component.key.replace(pattern, '_') + "_" + record.metric.replace(pattern, "_"),
        "points": [{
          "timestamp": Math.floor(Date.now() / 1000),
          "value": record.value
        }],
        "resources": [{
          "name": sonarResponse.data.component.key,
          "type": sonarResponse.data.component.qualifier
        }],
        "source_type_name": sonarResponse.data.component.key,
        "tags": [
          "resource_name:" + sonarResponse.data.component.key,
          "sonarqube:" + record.metric
        ],
        "type": Number(metricType),
        "unit": metricUnit
      })
    });
    const data = {
      "series": payloadSeries
    };
    console.log(JSON.stringify(data, null, 2));
    const ddResponse = await axios.post(`${ddUrl}/api/v2/series`, data, {
      'headers': {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Content-Encoding': 'identity',
        'DD-API-KEY': ddApikey,
        'DD-APPLICATION-KEY': ddApplicationKey
      }
    });
    console.log('datadog submit response data=', ddResponse.data);
    core.setOutput('status', ddResponse.status);
    core.setOutput('data', ddResponse.data);
  } catch (error) {
    core.setFailed(error.message);
  }
}

bootstrap();