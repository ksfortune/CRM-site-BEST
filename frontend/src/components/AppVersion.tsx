import packageJson from '../../package.json';

export default function AppVersion() {
  return (
    <div className="app-version" aria-hidden="true">
      v{packageJson.version}
    </div>
  );
}
