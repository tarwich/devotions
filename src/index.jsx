import { useEventTarget } from 'ahooks';
import { useEffect, useState } from 'react';
import { render } from 'react-dom';
import { ipcRenderer } from 'electron';
import './styles.css';

export default function Application() {
  const [query, { onChange: onQueryChange }] = useEventTarget({
    initialValue: '',
  });
  const [version, { onChange: onVersionChange }] = useEventTarget({
    initialValue: 'NIV',
  });
  const [searchUrl, setSearchUrl] = useState('');
  const [passage, setPassage] = useState('');
  const [content, setContent] = useState('');

  useEffect(() => {
    if (query) {
      setSearchUrl(
        `https://crossorigin.me/https://www.biblegateway.com/passage/?search=${query
          .replace(/\s+/g, '+')
          .replace(':', '.')}&version=${version}`
      );
    }
  }, [query, version]);

  const generate = async () => {
    if (!searchUrl) return;

    try {
      ipcRenderer.send('passage', searchUrl);
      ipcRenderer.on('passage-reply', (event, arg) => {
        console.log(arg);
      });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="App">
      <label>
        Passage:
        <input type="text" value={query} onChange={onQueryChange} />
      </label>
      <label>
        Version:
        <input type="text" value={version} onChange={onVersionChange} />
      </label>
      <button onClick={generate}>Generate</button>
      <div>Search Url {searchUrl}</div>
      <div>
        <h4>Passage</h4>
        {passage}
      </div>
      <div>
        <h4>Content</h4>
        {content}
      </div>
    </div>
  );
}

const root =
  document.querySelector('main') ||
  document.body.append(document.createElement('main'));
render(<Application />, root);
