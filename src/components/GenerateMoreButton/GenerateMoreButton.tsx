import { Button } from '@ui/Button';
import { useNavigate } from 'react-router-dom';

export const GenerateMoreButton = () => {
    const navigate = useNavigate();

    const handleGenerateMore = () => {
        navigate('/generate');
    };

    return (
        <Button variant="primary" onClick={handleGenerateMore} data-testid="generate-more-button">
            Сгенерировать больше
        </Button>
    );
};
