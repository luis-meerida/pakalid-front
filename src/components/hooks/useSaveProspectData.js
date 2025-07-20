import { useEffect } from 'react';

export const useSaveProspectData = (form, fileList, ciudad) => {
  useEffect(() => {
    const handleBeforeUnload = () => {
      const values = form.getFieldsValue();
      const prospectData = {
        name: values.name,
        address: values.address,
        suburb: values.neighborhood,
        postal_code: values.zipCode,
        fk_prospect_status_id: 1,
        fk_city_code_id: ciudad || '',
        logo_path: fileList[0]?.name || '',
        latitud: '',
        longitud: '',
        zoom: '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        deleted_at: null,
      };
      localStorage.setItem('prospectData', JSON.stringify(prospectData));
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [form, fileList, ciudad]);
};
