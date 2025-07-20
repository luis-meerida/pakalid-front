import { useEffect } from 'react';

export const useSaveProspectData = (form, fileList, ciudad, phones) => {
  useEffect(() => {
    const saveData = () => {
      const values = form.getFieldsValue();

      const prospectData = {
        name: values.name || '',
        address: values.address || '',
        suburb: values.neighborhood || '',
        postal_code: values.zipCode || '',
        fk_prospect_status_id: 1,
        fk_city_code_id: ciudad || '',
        logo_path: fileList?.[0]?.name || '',
        latitud: values.latitud || '',
        longitud: values.longitud || '',
        zoom: values.zoom || '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        deleted_at: null,
        phones: phones?.length > 0 ? phones : []
      };

      localStorage.setItem('prospectData', JSON.stringify(prospectData));
    };

    const unsubscribe = form.subscribe?.(({ values }) => {
      saveData(); // Ant Design no tiene form.subscribe, así que lo hacemos manualmente abajo
    });

    // Guardar también si cambian estos:
    saveData(); // Guarda al montar
  }, [form, fileList, ciudad, phones]);

  useEffect(() => {
    const handler = () => {
      const values = form.getFieldsValue();
      const prospectData = {
        name: values.name || '',
        address: values.address || '',
        suburb: values.neighborhood || '',
        postal_code: values.zipCode || '',
        fk_prospect_status_id: 1,
        fk_city_code_id: ciudad || '',
        logo_path: fileList?.[0]?.name || '',
        latitud: values.latitud || '',
        longitud: values.longitud || '',
        zoom: values.zoom || '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        deleted_at: null,
        phones: phones?.length > 0 ? phones : []
      };

      localStorage.setItem('prospectData', JSON.stringify(prospectData));
    };

    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [form, fileList, ciudad, phones]);
};
