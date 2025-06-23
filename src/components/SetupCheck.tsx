import React, { useState, useEffect } from 'react'
import { CheckCircle, XCircle, AlertCircle, Database, Key, Upload, Users } from 'lucide-react'
import { supabase, testConnection } from '../lib/supabase'

const SetupCheck: React.FC = () => {
  const [checks, setChecks] = useState({
    envVars: false,
    connection: false,
    tables: false,
    storage: false,
    auth: false
  })
  const [loading, setLoading] = useState(true)
  const [details, setDetails] = useState<string[]>([])

  useEffect(() => {
    runSetupChecks()
  }, [])

  const runSetupChecks = async () => {
    const newChecks = { ...checks }
    const newDetails: string[] = []

    // Check environment variables
    const hasEnvVars = !!(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY)
    newChecks.envVars = hasEnvVars
    if (!hasEnvVars) {
      newDetails.push('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY')
    }

    // Check connection
    if (hasEnvVars) {
      newChecks.connection = await testConnection()
      if (!newChecks.connection) {
        newDetails.push('Cannot connect to Supabase - check your credentials')
      }
    }

    // Check tables exist
    if (newChecks.connection) {
      try {
        const { error } = await supabase.from('videos').select('count').limit(1)
        newChecks.tables = !error
        if (error) {
          newDetails.push('Database tables not found - run the migration SQL')
        }
      } catch (error) {
        newChecks.tables = false
        newDetails.push('Database schema not set up')
      }
    }

    // Check storage buckets
    if (newChecks.connection) {
      try {
        const { data: buckets } = await supabase.storage.listBuckets()
        const hasVideos = buckets?.some(b => b.name === 'videos')
        const hasThumbnails = buckets?.some(b => b.name === 'thumbnails')
        newChecks.storage = !!(hasVideos && hasThumbnails)
        if (!newChecks.storage) {
          newDetails.push('Storage buckets not configured - create videos and thumbnails buckets')
        }
      } catch (error) {
        newChecks.storage = false
        newDetails.push('Storage not accessible')
      }
    }

    // Check auth configuration
    if (newChecks.connection) {
      try {
        const { data } = await supabase.auth.getSession()
        newChecks.auth = true // If we can call auth methods, it's configured
      } catch (error) {
        newChecks.auth = false
        newDetails.push('Authentication not properly configured')
      }
    }

    setChecks(newChecks)
    setDetails(newDetails)
    setLoading(false)
  }

  const CheckItem: React.FC<{ 
    icon: React.ReactNode
    title: string
    status: boolean
    description: string 
  }> = ({ icon, title, status, description }) => (
    <div className="flex items-start space-x-4 p-4 glass rounded-xl border border-primary/10">
      <div className="flex-shrink-0 mt-1">
        {icon}
      </div>
      <div className="flex-1">
        <div className="flex items-center space-x-3 mb-2">
          <h3 className="font-semibold text-text-primary">{title}</h3>
          {status ? (
            <CheckCircle size={20} className="text-green-400" />
          ) : (
            <XCircle size={20} className="text-red-400" />
          )}
        </div>
        <p className="text-text-secondary text-sm">{description}</p>
      </div>
    </div>
  )

  const allChecksPass = Object.values(checks).every(Boolean)

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4 pulse-glow">
            <Database size={24} className="text-white" />
          </div>
          <p className="text-text-secondary">Checking setup...</p>
        </div>
      </div>
    )
  }

  if (allChecksPass) {
    return null // Don't show setup check if everything is working
  }

  return (
    <div className="min-h-screen bg-dark-bg p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-6">
            <AlertCircle size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-text-primary mb-4">Setup Required</h1>
          <p className="text-text-secondary text-lg">
            Your Supabase integration needs to be configured before you can use the platform.
          </p>
        </div>

        <div className="space-y-6 mb-8">
          <CheckItem
            icon={<Key size={24} className={checks.envVars ? 'text-green-400' : 'text-red-400'} />}
            title="Environment Variables"
            status={checks.envVars}
            description="VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be configured"
          />

          <CheckItem
            icon={<Database size={24} className={checks.connection ? 'text-green-400' : 'text-red-400'} />}
            title="Database Connection"
            status={checks.connection}
            description="Connection to your Supabase project"
          />

          <CheckItem
            icon={<Database size={24} className={checks.tables ? 'text-green-400' : 'text-red-400'} />}
            title="Database Schema"
            status={checks.tables}
            description="Required tables and functions for the video platform"
          />

          <CheckItem
            icon={<Upload size={24} className={checks.storage ? 'text-green-400' : 'text-red-400'} />}
            title="Storage Buckets"
            status={checks.storage}
            description="Videos and thumbnails storage buckets"
          />

          <CheckItem
            icon={<Users size={24} className={checks.auth ? 'text-green-400' : 'text-red-400'} />}
            title="Authentication"
            status={checks.auth}
            description="User authentication and authorization system"
          />
        </div>

        {details.length > 0 && (
          <div className="glass rounded-2xl p-6 border border-red-400/20 mb-8">
            <h3 className="font-semibold text-red-400 mb-4 flex items-center space-x-2">
              <AlertCircle size={20} />
              <span>Issues Found:</span>
            </h3>
            <ul className="space-y-2">
              {details.map((detail, index) => (
                <li key={index} className="text-text-secondary text-sm flex items-start space-x-2">
                  <span className="text-red-400 mt-1">•</span>
                  <span>{detail}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="text-center">
          <button
            onClick={runSetupChecks}
            className="px-8 py-3 bg-primary rounded-xl text-white font-semibold hover:scale-105 transition-all duration-300 mr-4"
          >
            Recheck Setup
          </button>
          <a
            href="/SETUP_GUIDE.md"
            target="_blank"
            className="px-8 py-3 glass rounded-xl text-text-primary font-semibold hover:bg-primary/20 transition-all duration-300 inline-block"
          >
            View Setup Guide
          </a>
        </div>
      </div>
    </div>
  )
}

export default SetupCheck