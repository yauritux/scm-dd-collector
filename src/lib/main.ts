import { getInput, setOutput, setFailed } from "@actions/core";
import { DataDogSeriesPayload, SonarComponentMeasures } from "./types";
const axios = require('axios');

export default async function bootstrap() {
  try {
    const sonarUrl = getInput('sonar-base-url')
    const ddUrl = getInput('datadog-base-url')
    const component = getInput('component-name')
    const metricNames = getInput('metric-names')
    const metricType = getInput('metric-type')
    const metricUnit = getInput('metric-unit')
    const ddApikey = getInput('dd-api-key')
    const ddApplicationKey = getInput('dd-application-key')
    const sonarResponse = 
      await axios.get(`${sonarUrl}/api/measures/component?component=${component}&metricKeys=${metricNames}`)
    console.log(JSON.stringify(sonarResponse.data, null, 2))
    const pattern = /[-$.+#)]/g;
    const payloadSeries: DataDogSeriesPayload[] = [];
    sonarResponse.data.component.measures.forEach((record: SonarComponentMeasures) => {
      payloadSeries.push({
        "metric": sonarResponse.data.component.key.replace(pattern, '_') + "_" + record.metric.replace(pattern, "_"),
        "points": [{
          "timestamp": Math.floor(Date.now() / 1000),
          "value": record?.value
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
    setOutput('status', ddResponse.status);
    setOutput('data', ddResponse.data);
  } catch (error: any) {
    setFailed(error?.message);
  }
}