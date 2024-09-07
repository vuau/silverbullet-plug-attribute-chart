import { YAML, system } from "../silverbullet/plug-api/syscalls.ts";
import {parseQuery} from "../silverbullet/plug-api/lib/parse_query.ts";
import { CodeWidgetContent } from "../silverbullet/plug-api/types.ts";
import { loadPageObject } from "../silverbullet/plugs/template/page.ts";

export async function widget(
  bodyText: string,
  pageName: string
): Promise<CodeWidgetContent>  {
  const config = await system.getSpaceConfig();
  const pageObject = await loadPageObject(pageName);
  try {
    const chartConfig:any = await YAML.parse(bodyText);
    const query = await parseQuery(chartConfig.query);
    const attributes = chartConfig.attributes || {};
    const results = await system.invokeFunction(
      "query.renderQuery",
      query,
      {
        page: pageObject,
        config,
      },
    );
    return {
      html: `
      <style>
        html[data-theme=dark] {
          color-scheme: dark;
          --root-background-color: #111;
          --root-color: #fff;
          --top-background-color: #262626;
        }
        html {
          --root-background-color: #fff;
          --root-color: inherit;
          --top-background-color: #e1e1e1;
          --ui-font: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"
        }
        body{
          margin:0;
          background-color:var(--root-background-color);
          color:var(--root-color);
          font-family: var(--ui-font);
        }
      </style>
      <canvas id="myChart"></canvas>`,
      script: `
        loadJsByUrl("https://cdn.jsdelivr.net/npm/chart.js").then(() => {
          const chartData = ${JSON.stringify(createChartData(results, attributes))};
          console.log(${JSON.stringify({ results, attributes })}, chartData);
          const ctx = document.getElementById('myChart');
          const myChart = new Chart(ctx, {
            type: 'line',
            data: chartData,
            options: {
              scales: {
                y: {
                  beginAtZero: true
                }
              }
            }
          })
        });
      `
    };
  } catch (e: any) {
    return { markdown: `**Error:** ${e.message}` };
  }
}

export function createChartData(results: any, attributes: { [name: string]: { name: string; type?: string }}= {}) {
  const labels = results.map((d: any) => d.name.replace("Journal/Day/", ""));
  const datasets = [];

  for (const attribute of Object.values(attributes)) {
    if (!attribute.name) {
      continue;
    }
    datasets.push({
      type: attribute.type || 'line',
      label: attribute.name,
      data: results.map((d: any) => d.attribute[attribute.name]),
    }); 
  }
  return { labels, datasets };
}
