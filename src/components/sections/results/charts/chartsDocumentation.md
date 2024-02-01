# DOCUMENTATION

## Chart Components

Chart components build chartjs from props/options.
Instead of visual component, they have no controlled options.

## Commons props

- id (mandatory) : id of the chart, to use in report for example
- session (mandatory) : session
- datasetOptions : object with params to build dataset to show (e.g. indic, aggregate, etc.)
- printOptions : object with param for the display

### printOptions

- printMode : to specify if the chart is going to be used in a report (true -> include in report / false)

## Best practices

Build data needed inside the components.
Name the component with its purpose (e.g. ValueDistributionChart showing the distribution of the production in apie chart).
Put chart options outside the builder (utils function inside the file, e.g. buildChartOptions(..[args])).

## Managing period


## Refactoring

ComparativeHorizontalBarChart

