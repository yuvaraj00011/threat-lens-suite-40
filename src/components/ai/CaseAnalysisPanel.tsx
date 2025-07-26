import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { 
  AlertTriangle, 
  Clock, 
  Users, 
  Search, 
  FileText, 
  Shield,
  CheckCircle,
  XCircle,
  Eye,
  Target
} from 'lucide-react';

interface CaseAnalysis {
  caseType: string;
  priority: string;
  suspects: string[];
  evidence: string[];
  nextSteps: string[];
  questions: string[];
  digitalTrails: string[];
  riskFactors: string[];
}

interface CaseAnalysisPanelProps {
  analysis: CaseAnalysis | null;
  isAnalyzing: boolean;
}

export function CaseAnalysisPanel({ analysis, isAnalyzing }: CaseAnalysisPanelProps) {
  if (isAnalyzing) {
    return (
      <Card className="bg-card/50 border-cyber-glow/20 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-center space-x-2">
            <div className="w-4 h-4 bg-cyber-glow rounded-full animate-pulse" />
            <span className="text-cyber-glow font-mono">Analyzing case details...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!analysis) {
    return null;
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'high': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default: return 'bg-green-500/20 text-green-400 border-green-500/30';
    }
  };

  const getCaseTypeIcon = (caseType: string) => {
    switch (caseType) {
      case 'theft': return <Target className="h-4 w-4" />;
      case 'assault': return <AlertTriangle className="h-4 w-4" />;
      case 'fraud': return <Shield className="h-4 w-4" />;
      case 'cybercrime': return <Search className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Case Overview */}
      <Card className="bg-card/50 border-cyber-glow/20 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-cyber-glow font-cyber">
            {getCaseTypeIcon(analysis.caseType)}
            Case Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-mono text-muted-foreground">Type:</span>
              <Badge variant="outline" className="border-cyber-glow/30">
                {analysis.caseType.replace('_', ' ').toUpperCase()}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-mono text-muted-foreground">Priority:</span>
              <Badge className={getPriorityColor(analysis.priority)}>
                {analysis.priority.toUpperCase()}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Risk Factors */}
      {analysis.riskFactors.length > 0 && (
        <Alert className="border-red-500/30 bg-red-500/10">
          <AlertTriangle className="h-4 w-4 text-red-400" />
          <AlertDescription className="text-red-300">
            <strong>Risk Factors Identified:</strong>
            <ul className="mt-2 space-y-1">
              {analysis.riskFactors.map((risk, index) => (
                <li key={index} className="text-xs">• {risk}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Next Steps */}
      <Card className="bg-card/50 border-cyber-glow/20 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-accent font-cyber">
            <CheckCircle className="h-4 w-4" />
            Immediate Action Items
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {analysis.nextSteps.map((step, index) => (
              <div key={index} className="flex items-start gap-2 p-2 rounded bg-accent/10 border border-accent/20">
                <span className="text-xs font-mono text-accent bg-accent/20 rounded px-1 mt-0.5">
                  {index + 1}
                </span>
                <span className="text-xs text-foreground">{step}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Follow-up Questions */}
      <Card className="bg-card/50 border-cyber-glow/20 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-cyber-glow font-cyber">
            <Eye className="h-4 w-4" />
            Key Questions to Ask
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {analysis.questions.map((question, index) => (
              <div key={index} className="p-2 rounded bg-cyber-glow/10 border border-cyber-glow/20">
                <span className="text-xs text-foreground">❓ {question}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Digital Investigation */}
      {analysis.digitalTrails.length > 0 && (
        <Card className="bg-card/50 border-cyber-glow-secondary/20 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-cyber-glow-secondary font-cyber">
              <Search className="h-4 w-4" />
              Digital Investigation Paths
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {analysis.digitalTrails.map((trail, index) => (
                <div key={index} className="p-2 rounded bg-cyber-glow-secondary/10 border border-cyber-glow-secondary/20">
                  <span className="text-xs text-foreground">🔍 {trail}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Suspects & Evidence */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {analysis.suspects.length > 0 && (
          <Card className="bg-card/50 border-orange-500/20 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-orange-400 font-cyber">
                <Users className="h-4 w-4" />
                Suspects Identified
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {analysis.suspects.map((suspect, index) => (
                  <div key={index} className="p-2 rounded bg-orange-500/10 border border-orange-500/20">
                    <span className="text-xs text-foreground">👤 {suspect}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {analysis.evidence.length > 0 && (
          <Card className="bg-card/50 border-purple-500/20 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-purple-400 font-cyber">
                <FileText className="h-4 w-4" />
                Evidence to Collect
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {analysis.evidence.map((evidence, index) => (
                  <div key={index} className="p-2 rounded bg-purple-500/10 border border-purple-500/20">
                    <span className="text-xs text-foreground">🔬 {evidence}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}