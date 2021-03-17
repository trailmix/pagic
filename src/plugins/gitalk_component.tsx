import { React, ReactDOM } from '../../deps.ts';
import type { GitalkProps } from '../Pagic.ts';

const Gitalk = (props: GitalkProps) => {
  React.useEffect(() => {
    // https://pegasaas.com/how-to-defer-render-blocking-css/
    // @ts-ignore
    const css = document.getElementById('gitalk-css');
    css.rel = 'stylesheet';
  });
  React.useEffect(() => {
    // @ts-ignore
    const container = document.getElementById('gitalk-container');
    ReactDOM.unmountComponentAtNode(container);
    container.innerHTML = '';
    new (window as any).Gitalk(props).render(container);
  }, [props.id]);
  return (
    <>
      <div id="gitalk-container" />
      <link id="gitalk-css" rel="preload" href="https://cdn.pagic.org/gitalk@1.6.2/dist/gitalk.css" as="style" />
      <script defer src="https://cdn.pagic.org/gitalk@1.6.2/dist/gitalk.min.js" />
    </>
  );
};

export default Gitalk;
