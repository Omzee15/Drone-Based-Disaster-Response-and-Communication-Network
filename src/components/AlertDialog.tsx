
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { DisasterPrediction } from '@/types/sensor';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AlertTriangle } from 'lucide-react';

interface DisasterAlertProps {
  prediction: DisasterPrediction | null;
  onDismiss: () => void;
  onAccept: () => void;
}

export const DisasterAlert: React.FC<DisasterAlertProps> = ({
  prediction,
  onDismiss,
  onAccept,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  // Open alert when prediction is received
  useEffect(() => {
    if (prediction) {
      setIsOpen(true);
      // Also show a toast for immediate notification
      toast({
        title: "Disaster Alert",
        description: `${prediction.type.charAt(0).toUpperCase() + prediction.type.slice(1)} detected at ${prediction.location.name}`,
        variant: "destructive",
      });
    } else {
      setIsOpen(false);
    }
  }, [prediction, toast]);

  const handleDismiss = () => {
    setIsOpen(false);
    // Call the onDismiss callback provided by parent component
    // This ensures the prediction state is also cleared in the parent
    onDismiss();
  };

  const handleAccept = () => {
    setIsOpen(false);
    onAccept();
    toast({
      title: "Drone Operation Initiated",
      description: "Disaster response phases have been activated.",
    });
  };

  if (!prediction) return null;

  return (
    <AlertDialog 
      open={isOpen} 
      onOpenChange={(open) => {
        if (!open) handleDismiss();
        else setIsOpen(true);
      }}
    >
      <AlertDialogContent className="bg-slate-800 border-red-500 text-white">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center text-red-400">
            <AlertTriangle className="mr-2 h-5 w-5" />
            {prediction.type.charAt(0).toUpperCase() + prediction.type.slice(1)} Alert
          </AlertDialogTitle>
          <AlertDialogDescription className="text-slate-300">
            <div className="space-y-3">
              <p>{prediction.description}</p>
              <div className="bg-slate-700 p-3 rounded-md">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-slate-400">Location:</span> {prediction.location.name}
                  </div>
                  <div>
                    <span className="text-slate-400">Severity:</span>{" "}
                    <span className={
                      prediction.severity === 'extreme' ? 'text-red-500' :
                      prediction.severity === 'high' ? 'text-red-400' :
                      prediction.severity === 'moderate' ? 'text-yellow-400' :
                      'text-green-400'
                    }>
                      {prediction.severity.toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400">Probability:</span>{" "}
                    {Math.round(prediction.probability * 100)}%
                  </div>
                  <div>
                    <span className="text-slate-400">ETA:</span>{" "}
                    {prediction.estimatedTime.toLocaleTimeString()}
                  </div>
                </div>
              </div>
              <p>Do you want to activate the drone response system?</p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel 
            onClick={handleDismiss}
            className="bg-slate-700 text-white hover:bg-slate-600"
          >
            Dismiss
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleAccept}
            className="bg-red-600 text-white hover:bg-red-700"
          >
            Activate Drones
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
