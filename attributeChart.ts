import { YAML, system, space } from "@silverbulletmd/silverbullet/syscalls";
import { parseQuery } from "@silverbulletmd/silverbullet/lib/parse_query";
import { CodeWidgetContent } from "@silverbulletmd/silverbullet/types";

type Attribute = {
  name: string;
  type?: string;
  label?: string;
  color?: string;
};

type ChartConfig = {
  query: string;
  attributes: Attribute[];
  options?: object
};

export async function widget(
  bodyText: string,
  pageName: string
): Promise<CodeWidgetContent>  {
  const config = await system.getSpaceConfig();
  const pageObject = await space.readPage(pageName);
  console.log(pageObject);
  try {
    const chartConfig: ChartConfig = await YAML.parse(bodyText);
    const query = await parseQuery(chartConfig.query);
    const attributes = chartConfig.attributes || [];
    const options = chartConfig.options || {};
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
          const ctx = document.getElementById('myChart');
          const myChart = new Chart(ctx, {
            data: chartData,
            options: ${JSON.stringify(options)}
          })
        });
      `
    };
  } catch (e: any) {
    return { markdown: `**Error:** ${e.message}` };
  }
}

export function createChartData(results: any, attributes: Attribute[] = []) {
  const labels = results.map((d: any) => d.name.replace("Journal/Day/", ""));
  const datasets = [];
  for (const attribute of attributes) {
    if (!attribute.name) {
      continue;
    }
    datasets.push({
      type: attribute.type || 'line',
      label: attribute.label || attribute.name,
      data: results.map((d: any) => d.attribute && d.attribute[attribute.name]),
      ...(attribute.color && { backgroundColor: attribute.color, borderColor: attribute.color }),
    }); 
  }
  return { labels, datasets };
}
