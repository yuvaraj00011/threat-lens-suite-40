import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, FileText, Clock, MapPin, User } from 'lucide-react';

interface CaseRecord {
  id: string;
  title: string;
  type: string;
  status: string;
  location: string;
  date: string;
  suspects: string[];
  modus: string;
  similarity: number;
}

interface CaseDatabaseProps {
  currentCase?: string;
  onSelectCase?: (caseId: string) => void;
}

// Mock case database - in production this would connect to real police databases
const mockCases: CaseRecord[] = [
  {
    id: 'C-2024-0156',
    title: 'Residential Burglary - Oak Street',
    type: 'theft',
    status: 'closed',
    location: 'Oak Street, Downtown',
    date: '2024-01-15',
    suspects: ['John Doe (convicted)', 'Unknown accomplice'],
    modus: 'Forced entry through rear window, electronics targeted',
    similarity: 87
  },
  {
    id: 'C-2024-0089',
    title: 'Home Invasion - Pine Avenue',
    type: 'theft',
    status: 'open',
    location: 'Pine Avenue, Residential District',
    date: '2024-01-08',
    suspects: ['Person of Interest: Mike Smith'],
    modus: 'Forced entry, similar electronic items stolen',
    similarity: 78
  },
  {
    id: 'C-2023-2341',
    title: 'Credit Card Fraud Ring',
    type: 'fraud',
    status: 'closed',
    location: 'Multiple locations',
    date: '2023-12-20',
    suspects: ['Sarah Johnson (convicted)', 'Tom Wilson (convicted)'],
    modus: 'Skimming devices at ATMs, identity theft',
    similarity: 65
  },
  {
    id: 'C-2024-0023',
    title: 'Cybercrime - Ransomware Attack',
    type: 'cybercrime',
    status: 'in_progress',
    location: 'Local Business District',
    date: '2024-01-03',
    suspects: ['Unknown cyber group'],
    modus: 'Phishing emails leading to ransomware deployment',
    similarity: 92
  }
];

export function CaseDatabase({ currentCase, onSelectCase }: CaseDatabaseProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCases, setFilteredCases] = useState<CaseRecord[]>([]);
  const [selectedType, setSelectedType] = useState<string>('all');

  useEffect(() => {
    // Filter cases based on search and type
    let filtered = mockCases;
    
    if (selectedType !== 'all') {
      filtered = filtered.filter(case_ => case_.type === selectedType);
    }
    
    if (searchTerm) {
      filtered = filtered.filter(case_ => 
        case_.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        case_.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        case_.suspects.some(suspect => suspect.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    // Sort by similarity score (highest first)
    filtered.sort((a, b) => b.similarity - a.similarity);
    
    setFilteredCases(filtered);
  }, [searchTerm, selectedType]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'in_progress': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'closed': return 'bg-green-500/20 text-green-400 border-green-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getSimilarityColor = (similarity: number) => {
    if (similarity >= 80) return 'text-red-400';
    if (similarity >= 60) return 'text-yellow-400';
    return 'text-green-400';
  };

  return (
    <Card className="bg-card/50 border-cyber-glow/20 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-cyber-glow font-cyber">
          <FileText className="h-5 w-5" />
          Similar Cases Database
        </CardTitle>
        
        {/* Search and Filters */}
        <div className="flex gap-2 mt-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search cases, locations, suspects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-card/30 border-cyber-glow/20"
            />
          </div>
          <select 
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-2 bg-card/30 border border-cyber-glow/20 rounded-md text-sm"
          >
            <option value="all">All Types</option>
            <option value="theft">Theft</option>
            <option value="fraud">Fraud</option>
            <option value="assault">Assault</option>
            <option value="cybercrime">Cybercrime</option>
          </select>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3 max-h-96 overflow-y-auto">
        {filteredCases.map((case_) => (
          <Card 
            key={case_.id} 
            className={`p-4 border transition-all duration-200 cursor-pointer hover:border-cyber-glow/50 ${
              case_.similarity >= 80 ? 'border-red-500/30 bg-red-500/5' : 'border-muted bg-card/20'
            }`}
            onClick={() => onSelectCase?.(case_.id)}
          >
            <div className="space-y-2">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-semibold text-sm text-foreground">{case_.title}</h4>
                  <p className="text-xs text-muted-foreground font-mono">{case_.id}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(case_.status)} variant="outline">
                    {case_.status.replace('_', ' ').toUpperCase()}
                  </Badge>
                  <span className={`text-xs font-bold ${getSimilarityColor(case_.similarity)}`}>
                    {case_.similarity}% match
                  </span>
                </div>
              </div>
              
              {/* Details */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-muted-foreground" />
                  <span className="text-muted-foreground">{case_.location}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3 text-muted-foreground" />
                  <span className="text-muted-foreground">{case_.date}</span>
                </div>
              </div>
              
              {/* Modus Operandi */}
              <div className="p-2 bg-muted/20 rounded text-xs">
                <strong>M.O.:</strong> {case_.modus}
              </div>
              
              {/* Suspects */}
              <div className="flex items-center gap-1 flex-wrap">
                <User className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Suspects:</span>
                {case_.suspects.map((suspect, idx) => (
                  <Badge key={idx} variant="outline" className="text-xs">
                    {suspect}
                  </Badge>
                ))}
              </div>
            </div>
          </Card>
        ))}
        
        {filteredCases.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No similar cases found</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}