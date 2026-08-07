# 07_FRONTEND_ARCHITECTURE.md

# TruthLayer System Design

## Chapter 7 -- Frontend Architecture

**Version:** 1.0\
**Status:** Source of Truth

------------------------------------------------------------------------

# Purpose

This chapter defines the architecture of the TruthLayer frontend
applications, their responsibilities, communication with the backend,
state management, and visualization strategy.

------------------------------------------------------------------------

# Frontend Applications

TruthLayer consists of two frontend applications.

## Project 1 -- Platform

-   Startup Website
-   Developer Console
-   Documentation
-   Internal Admin
-   Shared Design System

## Project 2 -- SDK Showcase

-   SDK Playground
-   API Playground
-   Live Verification Demo
-   Visualization Demo

------------------------------------------------------------------------

# High-Level Architecture

``` text
                 User
                  │
                  ▼
          Next.js Application
                  │
     ┌────────────┼────────────┐
     ▼            ▼            ▼
 Routing      UI Components   State
     │            │            │
     └────────────┼────────────┘
                  ▼
          API Client Layer
        REST / WebSocket / SSE
                  │
                  ▼
         FastAPI Backend Gateway
```

------------------------------------------------------------------------

# Technology Stack

Framework - Next.js (App Router)

Language - TypeScript

Styling - Tailwind CSS - shadcn/ui

Animation - Framer Motion

Charts - Recharts

Data Fetching - TanStack Query

State Management - Zustand

Forms - React Hook Form - Zod

------------------------------------------------------------------------

# Application Layers

## Presentation Layer

Responsibilities: - Pages - Layouts - Themes - Responsive UI

## Feature Layer

Modules: - Authentication - Verification - Dashboard - Receipts -
Analytics - Documentation - SDK Playground

## API Layer

Responsibilities: - REST client - WebSocket client - SSE client - Error
handling - Authentication headers

------------------------------------------------------------------------

# Shared Component Library

Components include:

-   Buttons
-   Inputs
-   Cards
-   Tables
-   Charts
-   Dialogs
-   Drawers
-   Code Blocks
-   JSON Viewer
-   Timeline
-   Trust Badge
-   Verification Receipt Card

------------------------------------------------------------------------

# State Management

Global state:

-   User
-   Theme
-   Session
-   API Keys
-   Verification Jobs

Server state:

-   Verification Results
-   Receipts
-   Analytics
-   Documentation

------------------------------------------------------------------------

# Verification UI Flow

``` text
Prompt
   │
   ▼
Submit
   │
   ▼
Loading
   │
   ▼
Streaming Response
   │
   ▼
Live Verification
   │
   ▼
Trust Score
   │
   ▼
Evidence
   │
   ▼
Receipt
```

------------------------------------------------------------------------

# Visualization Components

The dashboard visualizes:

-   Verification timeline
-   Claim dependency graph
-   Retrieval evidence
-   Trust score gauge
-   Semantic entropy
-   Agreement score
-   Agent execution timeline
-   LangGraph execution graph

------------------------------------------------------------------------

# Backend Communication

REST APIs

-   Authentication
-   Receipts
-   Analytics
-   Configuration

WebSockets

-   Live verification updates
-   Agent progress
-   Trust score changes

Server-Sent Events

-   Streaming LLM output
-   Verification events

------------------------------------------------------------------------

# Folder Structure

``` text
apps/
├── platform/
│   ├── app/
│   ├── components/
│   ├── features/
│   ├── hooks/
│   ├── lib/
│   ├── services/
│   └── store/
│
└── sdk-showcase/
    ├── app/
    ├── components/
    ├── features/
    ├── hooks/
    ├── lib/
    ├── services/
    └── store/
```

------------------------------------------------------------------------

# Performance Strategy

-   Route-based code splitting
-   Server Components where appropriate
-   Dynamic imports
-   Optimistic updates
-   Query caching
-   Image optimization
-   Lazy-loaded charts

------------------------------------------------------------------------

# Accessibility

-   WCAG 2.1 AA
-   Keyboard navigation
-   Screen reader support
-   High-contrast themes
-   Reduced-motion support

------------------------------------------------------------------------

# Design Principles

1.  Component-driven architecture.
2.  Reusable UI library.
3.  API-first communication.
4.  Real-time verification experience.
5.  Responsive by default.
6.  Explainability through visualization.

------------------------------------------------------------------------

# Relationship to Other Chapters

-   Chapter 06 defined the backend architecture.
-   **Chapter 07 defines the frontend architecture.**
-   Chapter 08 describes the LangGraph workflow that connects the
    frontend and backend.
