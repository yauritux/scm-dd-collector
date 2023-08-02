import { getInput, setOutput, setFailed } from "@actions/core";
import { DataDogSeriesPayload, SonarComponentMeasures, SonarComponentMetric } from "./types";
import axios from "axios";

const fetchSonarMetrics = async (component: string, metricKeys: string) => {
  const sonarUrl = getInput('sonar-base-url')
  const sonarResponse = 
    await axios.get(`${sonarUrl}/api/measures/component?component=${component}&metricKeys=${metricKeys}`)
  console.log(JSON.stringify(sonarResponse.data, null, 2))
  return sonarResponse
}

const submitDDMetrics = async (sonarComponent: SonarComponentMetric) => {
  const ddUrl = getInput('datadog-base-url')
  const metricType = getInput('metric-type')
  const metricUnit = getInput('metric-unit')
  const ddApikey = getInput('dd-api-key')  

  if (!sonarComponent || sonarComponent?.component.hasOwnProperty("measures")) {
    return
  }

  const pattern = /[-$.+#)]/g
  const payloadSeries: DataDogSeriesPayload[] = []
  sonarComponent.component?.measures.forEach((record: SonarComponentMeasures) => {
    payloadSeries.push({
      "metric": sonarComponent.component?.key.replace(pattern, '_') + "_" + record.metric.replace(pattern, "_"),
      "points": [{
        "timestamp": Math.floor(Date.now() / 1000),
        "value": record?.value
      }],
      "resources": [{
        "name": sonarComponent.component?.key,
        "type": sonarComponent.component?.qualifier
      }],
      "source_type_name": sonarComponent.component?.key,
      "tags": [
        "resource_name:" + sonarComponent.component?.key,
        "sonarqube:" + record.metric
      ],
      "type": Number(metricType),
      "unit": metricUnit
    })
  })

  const data = {
    "series": payloadSeries
  }
  console.log(JSON.stringify(data, null, 2))
  const ddResponse = await axios.post(`${ddUrl}/api/v2/series`, data, {
    'headers': {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Content-Encoding': 'identity',
      'DD-API-KEY': ddApikey
    }
  })
  console.log('datadog submit response data=', ddResponse.data)
  setOutput('status', ddResponse.status)
  setOutput('data', ddResponse.data)
}

export default async function bootstrap() {
  try {
    const component = getInput('component-name')
    const metricNames = getInput('metric-names')

    const sonarResponse = await fetchSonarMetrics(component, metricNames)
    await submitDDMetrics(sonarResponse.data)
  } catch (error: any) {
    setFailed(error?.message);
  }
}