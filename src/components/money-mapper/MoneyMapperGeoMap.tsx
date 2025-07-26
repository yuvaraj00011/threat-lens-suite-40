import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  MapPin, 
  Globe, 
  AlertTriangle,
  DollarSign
} from "lucide-react"

interface GeoMapProps {
  data: any
}

export function MoneyMapperGeoMap({ data }: GeoMapProps) {
  // Aggregate data by country
  const countryData = data.geoData.reduce((acc: any, item: any) => {
    if (!acc[item.country]) {
      acc[item.country] = {
        country: item.country,
        totalAmount: 0,
        avgRiskScore: 0,
        transactionCount: 0,
        riskScores: []
      }
    }
    acc[item.country].totalAmount += item.amount
    acc[item.country].riskScores.push(item.riskScore)
    acc[item.country].transactionCount += 1
    return acc
  }, {})

  // Calculate averages and sort by risk
  const countries = Object.values(countryData).map((country: any) => ({
    ...country,
    avgRiskScore: country.riskScores.reduce((sum: number, score: number) => sum + score, 0) / country.riskScores.length
  })).sort((a: any, b: any) => b.avgRiskScore - a.avgRiskScore)

  const getCountryFlag = (countryCode: string) => {
    const flags: { [key: string]: string } = {
      'US': '🇺🇸',
      'UK': '🇬🇧', 
      'DE': '🇩🇪',
      'SG': '🇸🇬',
      'CH': '🇨🇭',
      'PA': '🇵🇦'
    }
    return flags[countryCode] || '🏴'
  }

  const getCountryName = (countryCode: string) => {
    const names: { [key: string]: string } = {
      'US': 'United States',
      'UK': 'United Kingdom',
      'DE': 'Germany',
      'SG': 'Singapore',
      'CH': 'Switzerland',
      'PA': 'Panama'
    }
    return names[countryCode] || countryCode
  }

  const getRiskColor = (riskScore: number) => {
    if (riskScore >= 80) return 'text-red-500'
    if (riskScore >= 60) return 'text-cyber-warning'
    if (riskScore >= 40) return 'text-yellow-500'
    return 'text-cyber-glow'
  }

  const getRiskLevel = (riskScore: number) => {
    if (riskScore >= 80) return 'CRITICAL'
    if (riskScore >= 60) return 'HIGH'
    if (riskScore >= 40) return 'MEDIUM'
    return 'LOW'
  }

  const maxAmount = Math.max(...countries.map((c: any) => c.totalAmount))

  return (
    <div className="h-full space-y-6 overflow-auto">
      {/* Geographic Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 bg-card/30 border-cyber-glow/20">
          <CardHeader>
            <CardTitle className="text-lg font-cyber text-cyber-glow flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Geographic Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* World Map Placeholder */}
            <div className="relative h-64 bg-card/20 rounded-lg border border-cyber-glow/20 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-cyber-glow/5 to-cyber-glow/10" />
              
              {/* Map markers simulation */}
              <div className="absolute top-16 left-20 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
              <div className="absolute top-12 right-32 w-2 h-2 bg-cyber-warning rounded-full animate-pulse" />
              <div className="absolute bottom-20 left-40 w-4 h-4 bg-red-500 rounded-full animate-pulse" />
              <div className="absolute top-20 right-20 w-2 h-2 bg-cyber-glow rounded-full" />
              <div className="absolute bottom-16 right-28 w-3 h-3 bg-cyber-warning rounded-full" />
              
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center space-y-2">
                  <Globe className="h-12 w-12 mx-auto text-cyber-glow/50" />
                  <p className="text-sm font-mono text-muted-foreground">
                    Interactive World Map
                  </p>
                  <p className="text-xs font-mono text-muted-foreground">
                    Transaction flows visualization
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* High-Risk Jurisdictions */}
        <Card className="bg-card/30 border-cyber-glow/20">
          <CardHeader>
            <CardTitle className="text-lg font-cyber text-cyber-glow flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              High-Risk Jurisdictions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {countries.slice(0, 4).map((country: any, index) => (
              <div key={country.country} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{getCountryFlag(country.country)}</span>
                    <span className="text-sm font-mono">{country.country}</span>
                  </div>
                  <Badge 
                    variant="outline"
                    className={`text-xs ${getRiskColor(country.avgRiskScore)}`}
                  >
                    {getRiskLevel(country.avgRiskScore)}
                  </Badge>
                </div>
                <Progress 
                  value={country.avgRiskScore} 
                  className="h-2"
                />
                <div className="flex justify-between text-xs font-mono text-muted-foreground">
                  <span>Risk: {country.avgRiskScore.toFixed(1)}%</span>
                  <span>{country.transactionCount} txns</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Country Details Table */}
      <Card className="bg-card/30 border-cyber-glow/20">
        <CardHeader>
          <CardTitle className="text-lg font-cyber text-cyber-glow flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Country Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {countries.map((country: any) => (
              <div 
                key={country.country} 
                className="p-4 border border-cyber-glow/20 rounded-lg hover:bg-card/20 transition-all duration-200"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{getCountryFlag(country.country)}</span>
                    <div>
                      <h4 className="font-mono font-semibold">{getCountryName(country.country)}</h4>
                      <p className="text-xs font-mono text-muted-foreground">
                        {country.transactionCount} transactions
                      </p>
                    </div>
                  </div>
                  <Badge 
                    variant="outline"
                    className={`${getRiskColor(country.avgRiskScore)}`}
                  >
                    {getRiskLevel(country.avgRiskScore)} RISK
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <div className="text-xs font-mono text-muted-foreground">Total Volume</div>
                    <div className="text-lg font-mono font-semibold text-cyber-glow">
                      ${(country.totalAmount / 1000000).toFixed(1)}M
                    </div>
                    <Progress 
                      value={(country.totalAmount / maxAmount) * 100} 
                      className="h-1"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="text-xs font-mono text-muted-foreground">Average Risk</div>
                    <div className={`text-lg font-mono font-semibold ${getRiskColor(country.avgRiskScore)}`}>
                      {country.avgRiskScore.toFixed(1)}%
                    </div>
                    <Progress 
                      value={country.avgRiskScore} 
                      className="h-1"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="text-xs font-mono text-muted-foreground">Transaction Count</div>
                    <div className="text-lg font-mono font-semibold">
                      {country.transactionCount}
                    </div>
                    <div className="text-xs font-mono text-muted-foreground">
                      {((country.transactionCount / data.edges.length) * 100).toFixed(1)}% of total
                    </div>
                  </div>
                </div>

                {country.avgRiskScore >= 70 && (
                  <div className="mt-3 p-2 bg-red-500/10 border border-red-500/20 rounded text-xs font-mono text-red-500">
                    ⚠️ High-risk jurisdiction - Enhanced due diligence required
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Sanctions & Compliance */}
      <Card className="bg-card/30 border-cyber-glow/20">
        <CardHeader>
          <CardTitle className="text-lg font-cyber text-cyber-glow">
            Sanctions & Compliance Checks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 border border-cyber-warning/20 rounded-lg bg-cyber-warning/5">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-cyber-warning" />
                <span className="font-mono font-semibold text-cyber-warning">OFAC Sanctions</span>
              </div>
              <p className="text-xs font-mono text-muted-foreground">
                2 transactions involving OFAC-sanctioned entities detected
              </p>
            </div>

            <div className="p-3 border border-red-500/20 rounded-lg bg-red-500/5">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                <span className="font-mono font-semibold text-red-500">Tax Haven Activity</span>
              </div>
              <p className="text-xs font-mono text-muted-foreground">
                Significant flows through known tax haven jurisdictions
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}