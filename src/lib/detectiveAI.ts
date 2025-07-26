// Detective AI Knowledge Base and Analysis Engine
export interface CaseReport {
  id: string;
  title: string;
  description: string;
  type: 'theft' | 'fraud' | 'assault' | 'cybercrime' | 'homicide' | 'missing_person' | 'domestic' | 'drug' | 'other';
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in_progress' | 'closed' | 'cold';
  location: string;
  timeOfIncident: Date;
  reportedBy: string;
  witnesses: string[];
  suspects: Suspect[];
  evidence: Evidence[];
  digitalTrails: DigitalEvidence[];
  followUpActions: string[];
  nextSteps: string[];
  relatedCases: string[];
  riskAssessment: RiskAssessment;
}

export interface Suspect {
  name: string;
  description: string;
  lastKnownLocation: string;
  relationship: string;
  riskLevel: 'low' | 'medium' | 'high';
  previousOffenses: string[];
  alibi: string;
  motive: string;
}

export interface Evidence {
  type: 'physical' | 'digital' | 'testimonial' | 'documentary';
  description: string;
  location: string;
  collectedBy: string;
  chainOfCustody: boolean;
  analysisRequired: boolean;
  significance: 'low' | 'medium' | 'high' | 'critical';
}

export interface DigitalEvidence {
  type: 'phone_records' | 'social_media' | 'financial' | 'surveillance' | 'email' | 'metadata';
  source: string;
  timeframe: string;
  analysisStatus: 'pending' | 'in_progress' | 'completed';
  findings: string[];
}

export interface RiskAssessment {
  publicSafety: 'low' | 'medium' | 'high' | 'critical';
  flightRisk: 'low' | 'medium' | 'high';
  evidenceDegradation: 'low' | 'medium' | 'high';
  timeFactors: string[];
}

export class DetectiveAI {
  private investigationProcedures = {
    theft: {
      initialSteps: [
        "Secure the crime scene and preserve evidence",
        "Interview the victim and establish timeline",
        "Check for surveillance cameras in the area",
        "Canvas the neighborhood for witnesses",
        "Dust for fingerprints on entry points and touched surfaces",
        "Check for pawn shop activity and online marketplaces"
      ],
      keyQuestions: [
        "What was the exact time of the incident?",
        "Who had access to the location?",
        "Were doors/windows locked?",
        "Are there any surveillance cameras nearby?",
        "What is the estimated value of stolen items?",
        "Have there been similar incidents in the area recently?"
      ],
      digitalTrails: [
        "Review security camera footage",
        "Check cell phone tower data for the timeframe",
        "Monitor online marketplaces for stolen goods",
        "Analyze financial transactions if cards were stolen"
      ]
    },
    fraud: {
      initialSteps: [
        "Preserve all financial records and communications",
        "Contact financial institutions immediately",
        "Document all fraudulent transactions",
        "Identify the method of fraud (phishing, identity theft, etc.)",
        "Check credit reports for unauthorized accounts",
        "Report to financial crimes unit"
      ],
      keyQuestions: [
        "When did you first notice the fraudulent activity?",
        "What personal information might have been compromised?",
        "Have you received any suspicious communications?",
        "Who else has access to your financial information?",
        "Have you used any public Wi-Fi or unfamiliar computers recently?",
        "What is the total amount of financial loss?"
      ],
      digitalTrails: [
        "Trace IP addresses from fraudulent logins",
        "Analyze email headers and phishing attempts",
        "Review bank transaction patterns",
        "Check for malware on victim's devices"
      ]
    },
    cybercrime: {
      initialSteps: [
        "Isolate affected systems to prevent further damage",
        "Preserve digital evidence using forensic imaging",
        "Document all system logs and network activity",
        "Identify the attack vector and timeline",
        "Assess the scope of data breach or damage",
        "Contact cybercrime specialists"
      ],
      keyQuestions: [
        "When was the breach first detected?",
        "What systems and data were affected?",
        "Have you received any ransom demands?",
        "What security measures were in place?",
        "Who has administrative access to the systems?",
        "Have there been any recent employee departures?"
      ],
      digitalTrails: [
        "Analyze network logs and intrusion patterns",
        "Trace cryptocurrency transactions if ransom involved",
        "Examine malware signatures and attack methods",
        "Review user access logs and privilege escalations"
      ]
    },
    assault: {
      initialSteps: [
        "Ensure victim safety and medical attention",
        "Secure the scene and preserve physical evidence",
        "Document injuries with photographs",
        "Interview victim when medically cleared",
        "Identify and interview witnesses",
        "Check for surveillance footage"
      ],
      keyQuestions: [
        "Can you describe the attacker's physical appearance?",
        "Was there a weapon involved?",
        "Do you know the attacker or was it a stranger?",
        "What led up to the incident?",
        "Were there any witnesses present?",
        "Have you had any previous contact with this person?"
      ],
      digitalTrails: [
        "Review social media for threats or conflicts",
        "Check phone records for communications",
        "Analyze location data from devices",
        "Review any restraining orders or prior reports"
      ]
    }
  };

  analyzeCase(description: string): {
    caseType: string;
    priority: string;
    suspects: string[];
    evidence: string[];
    nextSteps: string[];
    questions: string[];
    digitalTrails: string[];
    riskFactors: string[];
  } {
    const analysis = this.performNLPAnalysis(description);
    const caseType = this.determineCaseType(description);
    const priority = this.assessPriority(description, caseType);
    
    return {
      caseType,
      priority,
      suspects: analysis.suspects,
      evidence: analysis.evidence,
      nextSteps: this.getRecommendedSteps(caseType, description),
      questions: this.generateFollowUpQuestions(caseType, description),
      digitalTrails: this.identifyDigitalTrails(caseType, description),
      riskFactors: this.assessRiskFactors(description)
    };
  }

  private performNLPAnalysis(description: string) {
    const suspects: string[] = [];
    const evidence: string[] = [];
    
    // Look for suspect indicators
    const suspectPatterns = [
      /suspect.*?named\s+(\w+)/gi,
      /perpetrator.*?(\w+)/gi,
      /attacker.*?(\w+)/gi,
      /(\w+)\s+threatened/gi,
      /(\w+)\s+was seen/gi
    ];
    
    suspectPatterns.forEach(pattern => {
      const matches = description.match(pattern);
      if (matches) {
        suspects.push(...matches);
      }
    });
    
    // Look for evidence indicators
    const evidencePatterns = [
      /found\s+(.*?)(?:at|in|on)/gi,
      /evidence.*?(fingerprints|DNA|weapon|blood|surveillance)/gi,
      /witness.*?saw\s+(.*?)(?:running|leaving)/gi,
      /(camera|video|recording|footage)/gi,
      /(weapon|knife|gun|bat)/gi
    ];
    
    evidencePatterns.forEach(pattern => {
      const matches = description.match(pattern);
      if (matches) {
        evidence.push(...matches);
      }
    });
    
    return { suspects, evidence };
  }

  private determineCaseType(description: string): string {
    const keywords = {
      theft: ['stolen', 'theft', 'burglary', 'robbery', 'missing items', 'break-in'],
      fraud: ['fraud', 'scam', 'phishing', 'identity theft', 'credit card', 'fake'],
      assault: ['assault', 'attack', 'hit', 'beaten', 'fight', 'violence'],
      cybercrime: ['hacked', 'ransomware', 'malware', 'data breach', 'cyber'],
      homicide: ['murder', 'killed', 'death', 'body found', 'homicide'],
      missing_person: ['missing', 'disappeared', 'last seen', 'runaway'],
      domestic: ['domestic', 'spouse', 'partner', 'family violence'],
      drug: ['drugs', 'narcotics', 'trafficking', 'dealing', 'substance']
    };
    
    const lowerDesc = description.toLowerCase();
    
    for (const [type, terms] of Object.entries(keywords)) {
      if (terms.some(term => lowerDesc.includes(term))) {
        return type;
      }
    }
    
    return 'other';
  }

  private assessPriority(description: string, caseType: string): string {
    const highPriorityIndicators = [
      'weapon', 'gun', 'knife', 'threat', 'violence', 'injured', 'bleeding',
      'ongoing', 'happening now', 'emergency', 'critical', 'urgent'
    ];
    
    const mediumPriorityIndicators = [
      'recent', 'today', 'yesterday', 'witness', 'evidence deteriorating'
    ];
    
    const lowerDesc = description.toLowerCase();
    
    if (caseType === 'homicide' || 
        highPriorityIndicators.some(indicator => lowerDesc.includes(indicator))) {
      return 'critical';
    }
    
    if (caseType === 'assault' || 
        mediumPriorityIndicators.some(indicator => lowerDesc.includes(indicator))) {
      return 'high';
    }
    
    if (caseType === 'theft' || caseType === 'fraud') {
      return 'medium';
    }
    
    return 'low';
  }

  private getRecommendedSteps(caseType: string, description: string): string[] {
    const procedures = this.investigationProcedures[caseType as keyof typeof this.investigationProcedures];
    if (procedures) {
      return procedures.initialSteps;
    }
    
    return [
      "Document all available information",
      "Interview witnesses and involved parties",
      "Preserve any available evidence",
      "Determine jurisdiction and notify appropriate units",
      "Establish timeline of events",
      "Begin preliminary investigation"
    ];
  }

  private generateFollowUpQuestions(caseType: string, description: string): string[] {
    const procedures = this.investigationProcedures[caseType as keyof typeof this.investigationProcedures];
    if (procedures) {
      return procedures.keyQuestions;
    }
    
    return [
      "When exactly did this incident occur?",
      "Who else was present or might have witnessed this?",
      "Can you provide more details about the suspect's description?",
      "What evidence is available at the scene?",
      "Are there any security cameras in the area?",
      "Have there been similar incidents recently?"
    ];
  }

  private identifyDigitalTrails(caseType: string, description: string): string[] {
    const procedures = this.investigationProcedures[caseType as keyof typeof this.investigationProcedures];
    if (procedures) {
      return procedures.digitalTrails;
    }
    
    return [
      "Check for surveillance camera footage",
      "Review cell phone records and location data",
      "Examine social media activity",
      "Analyze financial transaction records"
    ];
  }

  private assessRiskFactors(description: string): string[] {
    const risks: string[] = [];
    const lowerDesc = description.toLowerCase();
    
    if (lowerDesc.includes('weapon') || lowerDesc.includes('threat')) {
      risks.push('Armed suspect - high public safety risk');
    }
    
    if (lowerDesc.includes('ongoing') || lowerDesc.includes('happening')) {
      risks.push('Active situation - immediate response required');
    }
    
    if (lowerDesc.includes('evidence') && lowerDesc.includes('deteriorating')) {
      risks.push('Evidence degradation - time-sensitive collection needed');
    }
    
    if (lowerDesc.includes('fled') || lowerDesc.includes('escaped')) {
      risks.push('Flight risk - suspect may leave jurisdiction');
    }
    
    return risks;
  }

  generateInvestigationPlan(caseType: string, priority: string): {
    timeline: string;
    resources: string[];
    specialUnits: string[];
    legalConsiderations: string[];
  } {
    const plan = {
      timeline: this.getTimelineRecommendation(priority),
      resources: this.getRequiredResources(caseType),
      specialUnits: this.getSpecialUnits(caseType),
      legalConsiderations: this.getLegalConsiderations(caseType)
    };
    
    return plan;
  }

  private getTimelineRecommendation(priority: string): string {
    switch (priority) {
      case 'critical':
        return 'Immediate response required - dispatch units within 5 minutes';
      case 'high':
        return 'Urgent response - begin investigation within 1 hour';
      case 'medium':
        return 'Standard response - initiate within 24 hours';
      default:
        return 'Routine response - address within 48-72 hours';
    }
  }

  private getRequiredResources(caseType: string): string[] {
    const resources: { [key: string]: string[] } = {
      theft: ['Crime scene team', 'Fingerprint analysis', 'Surveillance review unit'],
      fraud: ['Financial crimes unit', 'Digital forensics', 'Bank liaison'],
      assault: ['Medical examiner', 'Photography unit', 'Victim advocate'],
      cybercrime: ['Digital forensics lab', 'Cybercrime specialists', 'Network analysis'],
      homicide: ['Homicide detectives', 'Medical examiner', 'Crime scene specialists', 'Evidence team']
    };
    
    return resources[caseType] || ['Standard investigation team', 'Evidence collection unit'];
  }

  private getSpecialUnits(caseType: string): string[] {
    const units: { [key: string]: string[] } = {
      cybercrime: ['Cybercrime Unit', 'Digital Forensics Lab'],
      drug: ['Narcotics Division', 'DEA Liaison'],
      fraud: ['Financial Crimes Unit', 'White Collar Crime Division'],
      homicide: ['Homicide Division', 'Major Case Squad'],
      domestic: ['Domestic Violence Unit', 'Victim Services']
    };
    
    return units[caseType] || [];
  }

  private getLegalConsiderations(caseType: string): string[] {
    return [
      'Ensure proper evidence collection procedures',
      'Read Miranda rights if arrest is likely',
      'Obtain necessary search warrants',
      'Maintain chain of custody for all evidence',
      'Document all procedural steps',
      'Consider victim rights and notification requirements'
    ];
  }
}

export const detectiveAI = new DetectiveAI();