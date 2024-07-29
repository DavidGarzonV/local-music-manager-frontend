import { Button } from 'primereact/button';
import { Divider } from 'primereact/divider';
import { InputText } from 'primereact/inputtext';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import getLabel from '../../../../utils/lang';
import { setLoadingApp } from '../../../../redux/slices/loading';
import fetchRequest from '../../../../utils/fetch';
import { setIsConfigured } from '../../../../redux/slices/login';

export default function ConfigureForm() {
  const dispatch = useDispatch();
	const [validate, setValidate] = useState(false);
  const [dataForm, setDataForm] = useState({
    client_id: '',
    project_id: 'local-music-manager',
    client_secret: '',
    redirect_uri: 'https://davidgarzonv.github.io/local-music-manager-auth',
  });

  const configure = async () => {
		setValidate(true);

    if (
      dataForm.client_id === '' ||
      dataForm.client_secret === '' ||
      dataForm.project_id === '' ||
      dataForm.redirect_uri === ''
    ) {
      return;
    }
		dispatch(setLoadingApp(true));

		const data = await fetchRequest<{Success: boolean}>('auth/configure', {
      method: 'POST',
			body: dataForm,
    });

		if (data?.Success) {
			dispatch(setIsConfigured(true));
			window.electron.ipcRenderer.sendMessage('reload-server');
		}
  };

  window.electron.ipcRenderer.on('server-reloaded', () => {
    window.location.reload();
  })

  return (
    <div>
      <div className="flex flex-column gap-2 mb-2">
        <label htmlFor="project_id">Project ID</label>
        <InputText
          id="project_id"
          placeholder="local-music-manager"
          required
          autoFocus
					value={dataForm.project_id}
					invalid={validate && dataForm.project_id.trim() === ''}
          onChange={(e) =>
            setDataForm({
              ...dataForm,
              project_id: e.target.value,
            })
          }
        />
      </div>
      <div className="flex flex-column gap-2 mb-2">
        <label htmlFor="client_id">Google Client ID</label>
        <InputText
          id="client_id"
          placeholder="Google Client ID"
          required
          autoFocus
					value={dataForm.client_id}
					invalid={validate && dataForm.client_id.trim() === ''}
          onChange={(e) =>
            setDataForm({
              ...dataForm,
              client_id: e.target.value,
            })
          }
        />
      </div>
      <div className="flex flex-column gap-2 mb-2">
        <label htmlFor="client_secret">Google Client Secret</label>
        <InputText
          id="client_secret"
          placeholder="Google Client Secret"
          required
          autoFocus
					value={dataForm.client_secret}
					invalid={validate && dataForm.client_secret.trim() === ''}
          onChange={(e) =>
            setDataForm({
              ...dataForm,
              client_secret: e.target.value,
            })
          }
        />
      </div>
      <div className="flex flex-column gap-2 mb-2">
        <label htmlFor="redirect_uri">Redirect URI</label>
        <InputText
          id="redirect_uri"
          placeholder="https://davidgarzonv.github.io/local-music-manager-auth"
          required
          autoFocus
					value={dataForm.redirect_uri}
					invalid={validate && dataForm.redirect_uri.trim() === ''}
          onChange={(e) =>
            setDataForm({
              ...dataForm,
              redirect_uri: e.target.value,
            })
          }
        />
      </div>
      <Divider />

      <div className="text-right">
        <Button
          label={getLabel('save')}
          severity="success"
          icon="pi pi-save"
          onClick={configure}
        />
      </div>
    </div>
  );
}
