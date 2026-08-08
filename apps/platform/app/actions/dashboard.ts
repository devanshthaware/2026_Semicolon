'use server'

import { auth } from '@/auth'
import { db } from '@/lib/db'

export async function getDashboardMetrics() {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      throw new Error('Unauthorized')
    }

    // Find the user's first organization
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      include: {
        organizations: {
          take: 1
        }
      }
    })

    const organizationId = user?.organizations[0]?.organizationId

    // If no org, return empty defaults
    if (!organizationId) {
      return {
        totalCalls: 0,
        verifiedRate: "0.0",
        avgTrust: 0,
        distributionData: [
          { name: 'High', value: 0 },
          { name: 'Medium', value: 0 },
          { name: 'Low', value: 0 },
        ],
        recentSessions: [],
        lineChartData: []
      }
    }

    // 1. Total API Calls
    const totalCalls = await db.verificationSession.count({
      where: { organizationId }
    })

    // 2. Verified Count
    const verifiedCount = await db.verificationSession.count({
      where: { organizationId, verdict: 'GROUNDED' }
    })
    const verifiedRate = totalCalls > 0 ? ((verifiedCount / totalCalls) * 100).toFixed(1) : "0.0"

    // 3. Avg Trust
    const trustAggregation = await db.verificationSession.aggregate({
      where: { organizationId },
      _avg: { trust: true }
    })
    const avgTrust = trustAggregation._avg.trust ? Math.round(trustAggregation._avg.trust) : 0

    // 4. Trust Distribution
    const highTrust = await db.verificationSession.count({
      where: { organizationId, trust: { gte: 90 } }
    })
    const mediumTrust = await db.verificationSession.count({
      where: { organizationId, trust: { gte: 70, lt: 90 } }
    })
    const lowTrust = await db.verificationSession.count({
      where: { organizationId, trust: { lt: 70 } }
    })

    // 5. Recent Sessions
    const recentSessions = await db.verificationSession.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        prompt: true,
        verdict: true,
        trust: true,
      }
    })

    // 6. Timeline (Last 24 hours grouped by hour)
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
    const recentCalls = await db.verificationSession.findMany({
      where: {
        organizationId,
        createdAt: { gte: twentyFourHoursAgo }
      },
      select: { createdAt: true }
    })

    const timelineMap = new Map<string, number>()
    // Initialize last 24 hours with 0
    for (let i = 23; i >= 0; i--) {
      const d = new Date(Date.now() - i * 60 * 60 * 1000)
      const hourKey = `${d.getHours().toString().padStart(2, '0')}:00`
      timelineMap.set(hourKey, 0)
    }

    recentCalls.forEach(call => {
      const hourKey = `${call.createdAt.getHours().toString().padStart(2, '0')}:00`
      if (timelineMap.has(hourKey)) {
        timelineMap.set(hourKey, timelineMap.get(hourKey)! + 1)
      }
    })

    const lineChartData = Array.from(timelineMap.entries()).map(([time, requests]) => ({
      time,
      requests
    }))

    return {
      totalCalls,
      verifiedRate,
      avgTrust,
      distributionData: [
        { name: 'High', value: highTrust },
        { name: 'Medium', value: mediumTrust },
        { name: 'Low', value: lowTrust },
      ],
      recentSessions: recentSessions.map(s => ({
        id: s.id,
        prompt: s.prompt.substring(0, 50) + (s.prompt.length > 50 ? '...' : ''),
        status: s.verdict === 'GROUNDED' ? 'verified' : (s.verdict === 'FLAGGED' ? 'error' : 'warning'),
        trust: Math.round(s.trust),
      })),
      lineChartData
    }
  } catch (error: any) {
    console.error("Dashboard Metrics Error:", error);
    throw new Error(error.message || "Unknown error fetching dashboard metrics");
  }
}
