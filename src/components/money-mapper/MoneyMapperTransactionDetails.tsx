import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { 
  Search, 
  Filter, 
  ArrowUpDown, 
  AlertTriangle, 
  Calendar,
  DollarSign,
  MapPin,
  Clock
} from "lucide-react"

interface TransactionDetailsProps {
  data: any
  selectedTransaction: any
  onTransactionSelect: (transaction: any) => void
}

export function MoneyMapperTransactionDetails({ 
  data, 
  selectedTransaction, 
  onTransactionSelect 
}: TransactionDetailsProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [riskFilter, setRiskFilter] = useState("all")
  const [sortBy, setSortBy] = useState("timestamp")
  const [sortOrder, setSortOrder] = useState("desc")

  // Filter and sort transactions
  const filteredTransactions = data.edges
    .filter((tx: any) => {
      const matchesSearch = tx.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          tx.source.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          tx.target.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesRisk = riskFilter === "all" || 
                         (riskFilter === "suspicious" && tx.suspicious) ||
                         (riskFilter === "high" && tx.riskLevel === "high") ||
                         (riskFilter === "medium" && tx.riskLevel === "medium") ||
                         (riskFilter === "low" && tx.riskLevel === "low")
      
      return matchesSearch && matchesRisk
    })
    .sort((a: any, b: any) => {
      let comparison = 0
      
      switch (sortBy) {
        case "amount":
          comparison = a.amount - b.amount
          break
        case "timestamp":
          comparison = new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
          break
        case "risk":
          const riskOrder = { high: 3, medium: 2, low: 1 }
          comparison = (riskOrder[a.riskLevel as keyof typeof riskOrder] || 0) - 
                      (riskOrder[b.riskLevel as keyof typeof riskOrder] || 0)
          break
        default:
          comparison = a[sortBy]?.localeCompare(b[sortBy]) || 0
      }
      
      return sortOrder === "desc" ? -comparison : comparison
    })

  const getRiskBadgeVariant = (riskLevel: string, suspicious: boolean) => {
    if (suspicious) return "destructive"
    switch (riskLevel) {
      case "high": return "destructive"
      case "medium": return "secondary"
      default: return "outline"
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date))
  }

  return (
    <div className="h-full flex gap-6">
      {/* Transaction List */}
      <div className="flex-1">
        <Card className="h-full bg-card/30 border-cyber-glow/20">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-cyber text-cyber-glow flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Transaction Analysis
              </CardTitle>
              <Badge variant="outline" className="font-mono">
                {filteredTransactions.length} transactions
              </Badge>
            </div>
            
            {/* Filters */}
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search transactions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={riskFilter} onValueChange={setRiskFilter}>
                <SelectTrigger className="w-48">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Risk Levels</SelectItem>
                  <SelectItem value="suspicious">Suspicious Only</SelectItem>
                  <SelectItem value="high">High Risk</SelectItem>
                  <SelectItem value="medium">Medium Risk</SelectItem>
                  <SelectItem value="low">Low Risk</SelectItem>
                </SelectContent>
              </Select>
              <Select value={`${sortBy}-${sortOrder}`} onValueChange={(value) => {
                const [newSortBy, newSortOrder] = value.split('-')
                setSortBy(newSortBy)
                setSortOrder(newSortOrder)
              }}>
                <SelectTrigger className="w-48">
                  <ArrowUpDown className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="timestamp-desc">Latest First</SelectItem>
                  <SelectItem value="timestamp-asc">Oldest First</SelectItem>
                  <SelectItem value="amount-desc">Highest Amount</SelectItem>
                  <SelectItem value="amount-asc">Lowest Amount</SelectItem>
                  <SelectItem value="risk-desc">Highest Risk</SelectItem>
                  <SelectItem value="risk-asc">Lowest Risk</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          
          <CardContent className="p-0 h-full">
            <div className="overflow-auto h-full">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Transaction ID</TableHead>
                    <TableHead>From → To</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Risk</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.map((transaction: any) => (
                    <TableRow
                      key={transaction.id}
                      className={`cursor-pointer hover:bg-card/50 ${
                        selectedTransaction?.id === transaction.id ? 'bg-cyber-glow/10' : ''
                      }`}
                      onClick={() => onTransactionSelect(transaction)}
                    >
                      <TableCell className="font-mono text-xs">
                        {transaction.id}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        <div className="space-y-1">
                          <div>{transaction.source}</div>
                          <div className="text-muted-foreground">↓</div>
                          <div>{transaction.target}</div>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono font-semibold">
                        {formatCurrency(transaction.amount)}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {formatDate(transaction.timestamp)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getRiskBadgeVariant(transaction.riskLevel, transaction.suspicious)}>
                          {transaction.suspicious ? 'SUSPICIOUS' : transaction.riskLevel.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {transaction.suspicious && (
                          <AlertTriangle className="h-4 w-4 text-red-500" />
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transaction Detail Panel */}
      {selectedTransaction && (
        <Card className="w-96 bg-card/30 border-cyber-glow/20">
          <CardHeader>
            <CardTitle className="text-lg font-cyber text-cyber-glow flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Transaction Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Basic Info */}
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm font-mono text-muted-foreground">ID:</span>
                <span className="text-sm font-mono">{selectedTransaction.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-mono text-muted-foreground">Amount:</span>
                <span className="text-sm font-mono font-semibold text-cyber-glow">
                  {formatCurrency(selectedTransaction.amount)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-mono text-muted-foreground">Risk Level:</span>
                <Badge variant={getRiskBadgeVariant(selectedTransaction.riskLevel, selectedTransaction.suspicious)}>
                  {selectedTransaction.suspicious ? 'SUSPICIOUS' : selectedTransaction.riskLevel.toUpperCase()}
                </Badge>
              </div>
            </div>

            {/* Timeline */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-mono text-muted-foreground">Timeline</span>
              </div>
              <div className="text-sm font-mono">
                {formatDate(selectedTransaction.timestamp)}
              </div>
            </div>

            {/* Source & Target */}
            <div className="space-y-4">
              <div className="p-3 border border-cyber-glow/20 rounded-lg">
                <div className="text-xs font-mono text-muted-foreground mb-1">Source Account</div>
                <div className="font-mono text-sm">{selectedTransaction.source}</div>
              </div>
              
              <div className="flex justify-center">
                <div className="w-8 h-8 rounded-full bg-cyber-glow/20 flex items-center justify-center">
                  <ArrowUpDown className="h-4 w-4 text-cyber-glow rotate-90" />
                </div>
              </div>
              
              <div className="p-3 border border-cyber-glow/20 rounded-lg">
                <div className="text-xs font-mono text-muted-foreground mb-1">Target Account</div>
                <div className="font-mono text-sm">{selectedTransaction.target}</div>
              </div>
            </div>

            {/* Risk Analysis */}
            {selectedTransaction.suspicious && (
              <div className="p-3 border border-red-500/20 rounded-lg bg-red-500/5">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  <span className="font-mono font-semibold text-red-500">Suspicious Activity</span>
                </div>
                <div className="space-y-1">
                  <div className="text-xs font-mono text-muted-foreground">
                    • Transaction amount structure suspicious
                  </div>
                  <div className="text-xs font-mono text-muted-foreground">
                    • High velocity pattern detected
                  </div>
                  <div className="text-xs font-mono text-muted-foreground">
                    • Potential layering activity
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="space-y-2">
              <Button variant="outline" size="sm" className="w-full border-cyber-warning/20 text-cyber-warning">
                Flag for Review
              </Button>
              <Button variant="outline" size="sm" className="w-full">
                Add to Investigation
              </Button>
              <Button variant="outline" size="sm" className="w-full">
                Generate Report
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}