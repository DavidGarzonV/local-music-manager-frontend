import { Checkbox } from 'primereact/checkbox';
import { ColumnFilterElementTemplateOptions } from 'primereact/column';
import { Tag } from 'primereact/tag';

export default function StatusRowFilterTemplate(
  options: ColumnFilterElementTemplateOptions,
) {
  const { value, filterApplyCallback } = options;
  return (
    <div>
      <div className="mb-2 flex justify-content-start gap-1">
        <Tag value="Procesado" severity="success" />
        <Checkbox
          checked={value === true}
          onChange={() => {
            filterApplyCallback(true);
          }}
        />
      </div>
      <div className="mb-2 flex justify-content-start gap-1">
        <Tag value="Sin procesar" severity="info" />
        <Checkbox
          checked={value === false}
          onChange={() => {
            filterApplyCallback(false);
          }}
        />
      </div>
      <div className=" flex justify-content-start gap-1">
        <Tag
          value="Todos"
          style={{
            background: 'var(--surface-200)',
            color: 'var(--surface-900)',
          }}
        />
        <Checkbox
          checked={value === null || value === undefined}
          onChange={() => {
            filterApplyCallback(null);
          }}
        />
      </div>
    </div>
  );
}
