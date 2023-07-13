# SCM-DD-COLLECTOR

This is a simple GH custom action that is doing pretty simple job to fetch some code metrics reported by Sonarqube and publish it accordingly to Datadog.

## Inputs

### `sonar-base-url`

**Required** Sonarqube Base URL.

### `datadog-base-url`

**Required** Datadog Base URL.

### `component-name`

**Required** The component name (could be a project name or a service name).

### `metric-names`

**Required** List of code metric names separated by comma (if more than one metric).
Find out what kind of metric supported by Sonarqube from this [link](https://sonarqube.inria.fr/sonarqube/web_api/api/metrics).

### `metric-type`

**Required** Type of metric used in report. Only support enum values as following:

-   0 (unspecified)
-   1 (count)
-   2 (rate)
-   3 (gauge)

### `metric-unit`

Unit of metric used in report. Check this [link](Check https://docs.datadoghq.com/metrics/types/).

## Example Usage

```yaml
uses: actions/scm-dd-collector@v1.0
with:
    component-name: platform-api
    metric-name: coverage,code_smells
    metric-type: 3
    metric-unit: percent
    dd-api-key: ${{ secrets.DD_API_KEY}}
    dd-application-key: ${{ secrets.DD_APPLICATION_KEY }}
```
