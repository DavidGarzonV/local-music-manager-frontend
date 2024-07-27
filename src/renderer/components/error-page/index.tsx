import getLabel from '../../utils/lang';

export default function ErrorPage() {
  return (
    <div id="error-page">
      <h1>Oops!</h1>
      <p>{getLabel('unexpectedError')}</p>
    </div>
  );
}
