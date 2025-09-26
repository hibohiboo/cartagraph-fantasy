# Implementation Tasks: 非同期TRPG風ゲーム「遺跡漁りとドブさらい」

**Branch**: `001-web-trpg-trpg` | **Date**: 2025-09-26 | **Status**: Phase 2 - Task Planning
**Prerequisites**: Phase 1 design documents complete (data-model.md, contracts/, quickstart.md, CLAUDE.md)

## Task Execution Strategy

### TDD Order Enforcement
**CRITICAL**: All tasks follow RED-GREEN-Refactor cycle:
1. Write failing test first (RED phase)
2. Implement minimal code to pass (GREEN phase)
3. Refactor for quality (Refactor phase)

### MVP Implementation Priority
**Frontend-Only MVP**: Backend integration deferred to future phases
- **Priority 1**: shared → core (ドメインロジック最優先TDD)
- **Priority 2**: frontend (E2Eテスト中心)
- **Priority 3**: ui (Storybookスナップショット)
- **Priority 4**: backend (後回し)

### Parallel Execution Markers
- **[P]**: Tasks can run in parallel (independent packages)
- **[S]**: Sequential dependency (must complete before next)

---

## Phase 1: Project Foundation (Tasks 1-8)

### Task 1: Setup Monorepo Infrastructure [P]
**Type**: Foundation | **Priority**: Critical | **Effort**: 2h
```bash
# Setup Bun workspace configuration
```
**Acceptance Criteria**:
- [ ] Root package.json with Bun workspaces configuration
- [ ] packages/ directory structure created
- [ ] Cross-package TypeScript project references configured
- [ ] Bun install works across all packages
- [ ] Each package has independent build scripts

**Dependencies**: None
**Output**: Monorepo foundation ready for package development

### Task 2: Create Shared Types Package [P]
**Type**: Foundation | **Priority**: Critical | **Effort**: 3h
```bash
# Create packages/shared with TypeScript type definitions
```
**Acceptance Criteria**:
- [ ] packages/shared/src/types/ with all domain types
- [ ] Conditional exports in package.json for Node/Browser
- [ ] TypeScript composite configuration
- [ ] Type validation tests (basic)
- [ ] Build pipeline generates .d.ts files

**Dependencies**: Task 1
**Tests Required**: Type validation, import/export verification
**Output**: Shared type definitions for all packages

### Task 3: Setup Core Rust WASM Package [P]
**Type**: Foundation | **Priority**: Critical | **Effort**: 4h
```bash
# Create packages/core with Rust WebAssembly setup
```
**Acceptance Criteria**:
- [ ] Cargo.toml configured for WebAssembly target
- [ ] wasm-pack integration with Bun build system
- [ ] Basic WebAssembly module exports to JavaScript
- [ ] tsify + ts-rs configuration for type safety
- [ ] WebWorker integration tests (basic)

**Dependencies**: Task 1, Task 2
**Tests Required**: WASM compilation, FFI interface
**Output**: Rust WASM foundation with type-safe JavaScript bindings

### Task 4: Create Frontend React Package [P]
**Type**: Foundation | **Priority**: High | **Effort**: 2h
```bash
# Create packages/frontend with React + TypeScript
```
**Acceptance Criteria**:
- [ ] React 19 + TypeScript 5.3 setup
- [ ] Vite configuration with WASM + WebWorker support
- [ ] Basic routing structure (React Router v7)
- [ ] WebWorker integration for WASM communication
- [ ] IndexedDB wrapper setup

**Dependencies**: Task 1, Task 2, Task 3
**Tests Required**: Component rendering, WebWorker communication
**Output**: React frontend foundation ready for UI development

### Task 5: Create UI Components Package [P]
**Type**: Foundation | **Priority**: Medium | **Effort**: 2h
```bash
# Create packages/ui with Storybook setup
```
**Acceptance Criteria**:
- [ ] Storybook 8.0 configuration
- [ ] Basic component structure
- [ ] React Flow integration for scenario editing
- [ ] Component testing with snapshot tests
- [ ] Export configuration for other packages

**Dependencies**: Task 1, Task 2
**Tests Required**: Storybook compilation, component snapshots
**Output**: UI component library with development environment

### Task 6: Write Core Domain Model Tests [S]
**Type**: TDD-Core | **Priority**: Critical | **Effort**: 4h
```bash
# Write failing tests for GameSession, Character, ScenarioTemplate aggregates
```
**Acceptance Criteria**:
- [ ] GameSession aggregate tests (session lifecycle, player management)
- [ ] Character aggregate tests (creation, card management, restrictions)
- [ ] ScenarioTemplate tests (scenario definition, scene transitions)
- [ ] Event Sourcing tests (event application, state reconstruction)
- [ ] All tests FAIL initially (RED phase)

**Dependencies**: Task 3
**Tests Required**: Domain logic validation, aggregate invariants, event sourcing
**Output**: Comprehensive failing test suite for core domain logic

### Task 7: Write WASM Interface Contract Tests [S]
**Type**: TDD-Integration | **Priority**: Critical | **Effort**: 3h
```bash
# Write failing tests for WebAssembly FFI interface
```
**Acceptance Criteria**:
- [ ] GameSession FFI method tests (createSession, addPlayer, useCard, rollDice)
- [ ] Type safety tests (Rust ↔ TypeScript type consistency)
- [ ] Serialization tests (complex objects across WASM boundary)
- [ ] Error handling tests (domain errors propagation)
- [ ] All tests FAIL initially (RED phase)

**Dependencies**: Task 3, Task 6
**Tests Required**: WebAssembly integration, FFI type safety
**Output**: Contract tests defining WASM interface requirements

### Task 8: Write Frontend E2E Test Scenarios [S]
**Type**: TDD-E2E | **Priority**: High | **Effort**: 3h
```bash
# Write failing E2E tests based on quickstart.md scenarios
```
**Acceptance Criteria**:
- [ ] Scenario 1: GM creates scenario, starts session (IndexedDB persistence)
- [ ] Scenario 2: Player creates character, joins session
- [ ] Scenario 3: Game play - card usage, dice rolling, scene progression
- [ ] Scenario 4: Cross-tab synchronization test
- [ ] All tests FAIL initially (RED phase)

**Dependencies**: Task 4
**Tests Required**: Full user workflow, persistence, real-time sync
**Output**: E2E test suite defining complete user stories

---

## Phase 2: Core Domain Implementation (Tasks 9-18)

### Task 9: Implement GameSession Aggregate [S]
**Type**: Implementation-Core | **Priority**: Critical | **Effort**: 5h
```bash
# Implement GameSession with Event Sourcing
```
**Acceptance Criteria**:
- [ ] GameSession aggregate with all required methods
- [ ] Event Sourcing implementation (apply_event, get_uncommitted_events)
- [ ] Player management (add, remove, status changes)
- [ ] Session state machine (Created → Recruiting → InProgress → Completed)
- [ ] Task 6 tests pass (GREEN phase)

**Dependencies**: Task 6 (Tests must exist and fail)
**Tests Required**: Domain logic tests from Task 6 must pass
**Output**: GameSession aggregate fully functional

### Task 10: Implement Character Aggregate [S]
**Type**: Implementation-Core | **Priority**: Critical | **Effort**: 3h
```bash
# Implement Character with session participation logic
```
**Acceptance Criteria**:
- [ ] Character aggregate with personal cards, tags, history
- [ ] Session participation validation
- [ ] Character restrictions management
- [ ] SessionCharacter value object for session-local state
- [ ] Task 6 character tests pass (GREEN phase)

**Dependencies**: Task 6 (Tests must exist and fail)
**Tests Required**: Character tests from Task 6 must pass
**Output**: Character aggregate with session integration

### Task 11: Implement ScenarioTemplate Aggregate [S]
**Type**: Implementation-Core | **Priority**: Critical | **Effort**: 4h
```bash
# Implement ScenarioTemplate with scene/event structure
```
**Acceptance Criteria**:
- [ ] ScenarioTemplate aggregate with nested scene definitions
- [ ] Scene transition logic
- [ ] Event trigger system
- [ ] Scenario derivation support
- [ ] Task 6 scenario tests pass (GREEN phase)

**Dependencies**: Task 6 (Tests must exist and fail)
**Tests Required**: ScenarioTemplate tests from Task 6 must pass
**Output**: ScenarioTemplate with complex scenario logic

### Task 12: Implement Card & Tag Systems [P]
**Type**: Implementation-Core | **Priority**: High | **Effort**: 3h
```bash
# Implement Card and Tag value objects
```
**Acceptance Criteria**:
- [ ] Card value object with type system, rarity, embedded events
- [ ] Tag value object with categories and typed values
- [ ] Card usage validation logic
- [ ] Tag acquisition/modification logic
- [ ] Integration tests with GameSession

**Dependencies**: Task 9
**Tests Required**: Card/Tag manipulation, integration with aggregates
**Output**: Complete card and tag system

### Task 13: Implement Dice System [P]
**Type**: Implementation-Core | **Priority**: High | **Effort**: 2h
```bash
# Implement dice rolling with advantage/disadvantage
```
**Acceptance Criteria**:
- [ ] DiceNotation parsing (2d6+1, advantage/disadvantage)
- [ ] DiceResult calculation with success determination (≥7)
- [ ] Integration with JavaScript entropy source
- [ ] Probability validation tests
- [ ] Performance tests for batch rolling

**Dependencies**: Task 9
**Tests Required**: Dice mechanics, entropy integration, probability validation
**Output**: Complete dice system with TRPG mechanics

### Task 14: Implement Rule Engine [S]
**Type**: Implementation-Core | **Priority**: Medium | **Effort**: 4h
```bash
# Implement rule validation and effect resolution
```
**Acceptance Criteria**:
- [ ] Card usage validation (context-dependent rules)
- [ ] Event effect resolution
- [ ] Scene transition rule checking
- [ ] Global vs scenario-specific rule handling
- [ ] Rule violation error reporting

**Dependencies**: Task 9, Task 10, Task 11, Task 12
**Tests Required**: Rule validation, effect resolution, error conditions
**Output**: Rule engine for game logic validation

### Task 15: Implement Event Log System [P]
**Type**: Implementation-Core | **Priority**: Medium | **Effort**: 2h
```bash
# Implement structured event logging
```
**Acceptance Criteria**:
- [ ] Event log with visibility controls
- [ ] Log entry serialization for persistence
- [ ] Log filtering by event type, player, visibility
- [ ] Integration with domain events
- [ ] Performance tests for large logs

**Dependencies**: Task 9
**Tests Required**: Log functionality, visibility rules, persistence
**Output**: Event logging system for game history

### Task 16: Implement WebAssembly FFI Interface [S]
**Type**: Implementation-Integration | **Priority**: Critical | **Effort**: 4h
```bash
# Implement WASM bindings with type safety
```
**Acceptance Criteria**:
- [ ] All WASM interface methods from contracts/wasm-interface.yaml
- [ ] Type-safe serialization/deserialization (tsify integration)
- [ ] Error handling across WASM boundary
- [ ] Performance optimization for large data structures
- [ ] Task 7 contract tests pass (GREEN phase)

**Dependencies**: Task 7 (Tests must exist and fail), Task 9-15
**Tests Required**: Contract tests from Task 7 must pass
**Output**: Type-safe WebAssembly interface

### Task 17: Implement WebWorker Integration [S]
**Type**: Implementation-Integration | **Priority**: Critical | **Effort**: 3h
```bash
# Implement WebWorker communication layer
```
**Acceptance Criteria**:
- [ ] WebWorker message protocol design
- [ ] WASM module loading and initialization in worker
- [ ] Message batching for performance
- [ ] Error propagation from worker to main thread
- [ ] Worker lifecycle management

**Dependencies**: Task 16, Task 4
**Tests Required**: Worker communication, error handling, lifecycle
**Output**: WebWorker integration for non-blocking WASM execution

### Task 18: Refactor Core Domain for Production [S]
**Type**: Refactor | **Priority**: Medium | **Effort**: 2h
```bash
# Code quality improvements and optimizations
```
**Acceptance Criteria**:
- [ ] Code review and cleanup
- [ ] Performance optimization identification
- [ ] Memory usage optimization for WASM
- [ ] Documentation improvements
- [ ] Error message quality improvements

**Dependencies**: Task 9-17 completed
**Tests Required**: All existing tests continue to pass
**Output**: Production-ready core domain implementation

---

## Phase 3: Frontend Implementation (Tasks 19-26)

### Task 19: Implement IndexedDB Event Store [S]
**Type**: Implementation-Frontend | **Priority**: Critical | **Effort**: 4h
```bash
# Implement IndexedDB-based event store
```
**Acceptance Criteria**:
- [ ] Event storage with efficient querying
- [ ] State snapshot management
- [ ] Cross-tab synchronization with BroadcastChannel
- [ ] Migration and versioning support
- [ ] Performance tests for large event streams

**Dependencies**: Task 16
**Tests Required**: Persistence, synchronization, performance
**Output**: Persistent event store for game state

### Task 20: Implement Session Management UI [S]
**Type**: Implementation-Frontend | **Priority**: High | **Effort**: 4h
```bash
# Create UI for session creation and management
```
**Acceptance Criteria**:
- [ ] Session creation form with scenario selection
- [ ] Session list view (active, completed)
- [ ] Player management UI (invite, kick, status)
- [ ] Session status display and controls
- [ ] Integration with WebWorker game engine

**Dependencies**: Task 4, Task 17, Task 19
**Tests Required**: UI interaction, state synchronization
**Output**: Session management interface

### Task 21: Implement Character Creation UI [P]
**Type**: Implementation-Frontend | **Priority**: High | **Effort**: 3h
```bash
# Create character creation and management UI
```
**Acceptance Criteria**:
- [ ] Character creation form
- [ ] Card and tag management interface
- [ ] Character history display
- [ ] Session participation status
- [ ] Character export/import functionality

**Dependencies**: Task 4, Task 17, Task 19
**Tests Required**: Form validation, persistence, import/export
**Output**: Character management interface

### Task 22: Implement Game Play UI [S]
**Type**: Implementation-Frontend | **Priority**: High | **Effort**: 5h
```bash
# Create main game play interface
```
**Acceptance Criteria**:
- [ ] Scene display with current objectives
- [ ] Card usage interface with drag-and-drop
- [ ] Dice rolling interface with animation
- [ ] Event log display with filtering
- [ ] Real-time updates from other players

**Dependencies**: Task 4, Task 17, Task 19, Task 20
**Tests Required**: Real-time interaction, animation, multi-player sync
**Output**: Core game play interface

### Task 23: Implement Scenario Editor UI [P]
**Type**: Implementation-Frontend | **Priority**: Medium | **Effort**: 4h
```bash
# Create scenario creation and editing interface
```
**Acceptance Criteria**:
- [ ] React Flow integration for visual scenario editing
- [ ] Scene and event creation forms
- [ ] Scenario testing and validation tools
- [ ] Export/import scenario functionality
- [ ] Version management for scenarios

**Dependencies**: Task 4, Task 5, Task 17
**Tests Required**: Visual editing, validation, import/export
**Output**: Visual scenario editor

### Task 24: Implement Cross-Tab Synchronization [S]
**Type**: Implementation-Frontend | **Priority**: High | **Effort**: 3h
```bash
# Implement real-time sync across browser tabs
```
**Acceptance Criteria**:
- [ ] BroadcastChannel event distribution
- [ ] State reconciliation across tabs
- [ ] Conflict resolution for simultaneous actions
- [ ] Connection status indicators
- [ ] Offline mode handling

**Dependencies**: Task 19, Task 20-23
**Tests Required**: Multi-tab scenarios, conflict resolution
**Output**: Multi-tab game synchronization

### Task 25: Implement UI State Management [S]
**Type**: Implementation-Frontend | **Priority**: Medium | **Effort**: 2h
```bash
# Setup React state management with Zustand
```
**Acceptance Criteria**:
- [ ] Global state store with Zustand
- [ ] React Query integration for async operations
- [ ] State persistence to localStorage
- [ ] Performance optimization with selective subscriptions
- [ ] Development tools integration

**Dependencies**: Task 20-24
**Tests Required**: State synchronization, persistence, performance
**Output**: Optimized frontend state management

### Task 26: Complete Frontend E2E Implementation [S]
**Type**: Implementation-E2E | **Priority**: Critical | **Effort**: 3h
```bash
# Ensure all E2E scenarios pass
```
**Acceptance Criteria**:
- [ ] All Task 8 E2E tests pass (GREEN phase)
- [ ] Performance meets targets (< 5MB WASM, responsive UI)
- [ ] Error handling and user feedback complete
- [ ] Browser compatibility verification
- [ ] Accessibility baseline compliance

**Dependencies**: Task 8 (Tests must exist and fail), Task 19-25
**Tests Required**: E2E tests from Task 8 must pass
**Output**: Complete frontend implementation passing all scenarios

---

## Phase 4: UI Components & Storybook (Tasks 27-30)

### Task 27: Create Core Game Components [P]
**Type**: Implementation-UI | **Priority**: Medium | **Effort**: 3h
```bash
# Implement reusable game UI components
```
**Acceptance Criteria**:
- [ ] Card component with type variants and states
- [ ] Dice roller component with animation
- [ ] Player status component
- [ ] Event log component with filtering
- [ ] Storybook stories for all components

**Dependencies**: Task 5
**Tests Required**: Component snapshot tests, interaction tests
**Output**: Core game UI component library

### Task 28: Create Scenario Editor Components [P]
**Type**: Implementation-UI | **Priority**: Medium | **Effort**: 3h
```bash
# Implement scenario editing UI components
```
**Acceptance Criteria**:
- [ ] React Flow node components (scene, event, transition)
- [ ] Form components for scenario editing
- [ ] Validation display components
- [ ] Preview components for scenario testing
- [ ] Storybook integration with complex scenarios

**Dependencies**: Task 5, Task 23
**Tests Required**: Component functionality, React Flow integration
**Output**: Scenario editor component library

### Task 29: Create Layout & Navigation Components [P]
**Type**: Implementation-UI | **Priority**: Low | **Effort**: 2h
```bash
# Implement application layout components
```
**Acceptance Criteria**:
- [ ] Application layout with responsive design
- [ ] Navigation components with route handling
- [ ] Modal and dialog components
- [ ] Loading and error state components
- [ ] Accessibility features (keyboard navigation, screen reader)

**Dependencies**: Task 5
**Tests Required**: Layout responsiveness, accessibility, navigation
**Output**: Application layout and navigation system

### Task 30: Complete UI Component Documentation [P]
**Type**: Documentation | **Priority**: Low | **Effort**: 2h
```bash
# Create comprehensive component documentation
```
**Acceptance Criteria**:
- [ ] Storybook documentation for all components
- [ ] Usage examples and best practices
- [ ] Component API documentation
- [ ] Design system documentation
- [ ] Performance guidelines

**Dependencies**: Task 27-29
**Tests Required**: Documentation accuracy, example functionality
**Output**: Complete UI component documentation

---

## Success Criteria

### Technical Validation
- [ ] All TDD tests pass (RED → GREEN → Refactor cycle completed)
- [ ] WebAssembly bundle size < 5MB
- [ ] Frontend UI responds within 100ms for user interactions
- [ ] IndexedDB operations complete within 50ms
- [ ] Cross-tab synchronization latency < 200ms

### Functional Validation
- [ ] Complete user workflow from spec.md → working game
- [ ] All acceptance scenarios from quickstart.md functional
- [ ] Game state persistence across browser sessions
- [ ] Multi-player asynchronous game play functional
- [ ] Scenario creation and editing functional

### Quality Gates
- [ ] TypeScript strict mode with zero errors
- [ ] Rust clippy warnings resolved
- [ ] Code coverage > 80% for core domain logic
- [ ] Storybook components render without errors
- [ ] Performance budgets maintained

---

## Task Dependencies Summary

**Critical Path**: 1 → 2 → 3 → 6 → 9 → 16 → 17 → 19 → 26 (E2E completion)

**Parallel Opportunities**:
- Tasks 2, 3, 4, 5 can run in parallel after Task 1
- Tasks 12, 13, 15 can run in parallel after Task 9
- Tasks 21, 23 can run in parallel with Task 20
- Tasks 27, 28, 29, 30 can run in parallel

**Total Estimated Effort**: 89 hours
**Critical Path Duration**: ~45 hours with parallelization
**MVP Delivery Target**: Core domain + Frontend (Tasks 1-26)

---

*Generated from Phase 1 design documents following Constitutional TDD principles*
*Next Phase: Execute tasks 1-8 (Foundation) following strict RED-GREEN-Refactor cycle*