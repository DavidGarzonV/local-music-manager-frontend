import { ProgressSpinner } from 'primereact/progressspinner';

export default function Loading() {
  return (
    <ProgressSpinner
      style={{ width: '50px', height: '50px' }}
      fill="var(--surface-ground)"
      animationDuration=".5s"
      className="ml-0 mr-2"
    />
  );
}
