import { useState } from 'react';
import { Layout, Steps, Typography, Result, Button } from 'antd';
import { SmileOutlined } from '@ant-design/icons';
import RegistrationForm from './components/RegistrationForm';

const { Header, Content, Footer } = Layout;
const { Title } = Typography;
const { Step } = Steps;

function App() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isRegistrationComplete, setIsRegistrationComplete] = useState(false);
  const [formData, setFormData] = useState({
    company: {},
    location: {},
    user: {},
    fiscal: {}
  });

  // Función optimizada para actualizar datos
  const updateFormData = (stepName, newData) => {
    setFormData(prev => ({
      ...prev,
      [stepName]: { ...prev[stepName], ...newData }
    }));
  };

  const handleCompleteRegistration = async (fiscalData) => {
    try {
      updateFormData('fiscal', fiscalData);
      const completeData = { ...formData, fiscal: fiscalData };
      
      // Simulación de envío al backend
      console.log('Datos completos para enviar:', completeData);
      
      // Aquí iría tu llamada real al API:
      // await fetch('/api/register', { 
      //   method: 'POST', 
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(completeData)
      // });
      
      setIsRegistrationComplete(true);
    } catch (error) {
      console.error('Error al registrar:', error);
      message.error('Error al completar el registro');
    }
  };

  const resetForm = () => {
    setCurrentStep(0);
    setIsRegistrationComplete(false);
    setFormData({
      company: {},
      location: {},
      user: {},
      fiscal: {}
    });
  };

  // Función para manejar el retroceso conservando datos
  const handlePrev = (stepData, currentStepName) => {
    if (stepData) {
      updateFormData(currentStepName, stepData);
    }
    setCurrentStep(prev => prev - 1);
  };

  const steps = [
    {
      title: 'Datos de tu Empresa',
      content: (
        <RegistrationForm.Step1 
          onNext={(data) => {
            updateFormData('company', data);
            setCurrentStep(1);
          }} 
          initialValues={formData.company}
        />
      ),
    },
    {
      title: 'Ubicación',
      content: (
        <RegistrationForm.Step2 
          onNext={(data) => {
            updateFormData('location', data);
            setCurrentStep(2);
          }}
          onPrev={(currentData) => handlePrev(currentData, 'location')}
          initialValues={formData.location}
        />
      ),
    },
    {
      title: 'Datos del usuario',
      content: (
        <RegistrationForm.Step3 
          onNext={(data) => {
            updateFormData('user', data);
            setCurrentStep(3);
          }}
          onPrev={(currentData) => handlePrev(currentData, 'user')}
          initialValues={formData.user}
        />
      ),
    },
    {
      title: 'Datos fiscales',
      content: (
        <RegistrationForm.Step4 
          onFinish={handleCompleteRegistration}
          onPrev={(currentData) => handlePrev(currentData, 'fiscal')}
          initialValues={formData.fiscal}
        />
      ),
    }
  ];

  if (isRegistrationComplete) {
    return (
      <Layout className="layout">
        <Header style={{ background: '#fff', padding: '0 20px' }}>
          <Title level={3} style={{ margin: '16px 0' }}>Pakal ID</Title>
        </Header>
        <Content style={{ padding: '50px', textAlign: 'center' }}>
          <Result
            icon={<SmileOutlined style={{ color: '#52c41a' }} />}
            title={<span style={{ fontSize: '24px' }}>¡Tu empresa ha sido registrada con éxito!</span>}
            subTitle="En breve te contactaremos"
            extra={[
              <Button 
                type="primary" 
                key="home"
                onClick={resetForm}
                style={{ marginTop: '20px' }}
              >
                Volver al inicio
              </Button>
            ]}
          />
        </Content>
        <Footer style={{ textAlign: 'center' }}>
          Pakal ID ©2025
        </Footer>
      </Layout>
    );
  }

  return (
    <Layout className="layout">
      <Header style={{ background: '#fff', padding: '0 20px' }}>
        <Title level={3} style={{ margin: '16px 0' }}>Pakal ID</Title>
      </Header>
      <Content style={{ padding: '0 50px', marginTop: 20 }}>
        <Title level={3} style={{ marginBottom: 24 }}>Registra Tu Empresa</Title>
        
        <Steps current={currentStep} style={{ marginBottom: 32 }}>
          {steps.map((item) => (
            <Step key={item.title} title={item.title} />
          ))}
        </Steps>
        
        <div className="site-layout-content">
          {steps[currentStep].content}
        </div>
      </Content>
      <Footer style={{ textAlign: 'center' }}>
        Pakal ID ©2025
      </Footer>
    </Layout>
  );
}

export default App;