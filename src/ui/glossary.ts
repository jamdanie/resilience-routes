import type { GlossaryTerm } from "../game/types";

export const glossaryTerms: GlossaryTerm[] = [
  {
    term: "Supply chain",
    definition: "The connected people, organizations, information, transportation, and facilities used to produce and deliver a product or service.",
    example: "A medical supply may move from a manufacturer to a port, then by rail to a warehouse, and finally by truck to a hospital.",
    whyItMatters: "A disruption in one link can delay or stop work in several other links."
  },
  {
    term: "Node",
    definition: "A place or system where activity is concentrated or transferred within a network.",
    example: "A port, airport, rail junction, warehouse, power station, or digital logistics hub can be a node.",
    whyItMatters: "Some nodes connect many routes, so their failure can affect a large part of the network."
  },
  {
    term: "Chokepoint",
    definition: "A narrow or limited part of a system through which a large amount of activity must pass.",
    example: "One bridge carrying the only rail line into a region is a chokepoint.",
    whyItMatters: "A single failure at a chokepoint can block many shipments at once."
  },
  {
    term: "Interdependence",
    definition: "A condition in which two or more systems depend on one another to operate.",
    example: "A warehouse needs electricity and data systems, while the power company may need fuel delivered through the same transportation network.",
    whyItMatters: "A failure can move in more than one direction between connected systems."
  },
  {
    term: "Resilience",
    definition: "The ability to prepare for disruption, continue essential work, adapt, and recover.",
    example: "A distribution center uses backup power, alternate carriers, and manual procedures during an outage.",
    whyItMatters: "Resilience is not the absence of problems; it is the ability to keep the most important services functioning."
  },
  {
    term: "Capacity",
    definition: "The amount of cargo, traffic, work, or demand a route or facility can handle during a period of time.",
    example: "An alternate road may exist but may only carry half the trucks normally handled by a rail corridor.",
    whyItMatters: "A backup route is not useful if it cannot handle the displaced demand."
  },
  {
    term: "Redundancy",
    definition: "A backup route, facility, system, supplier, or resource that can be used when the normal option is unavailable.",
    example: "A second port and a reserved trucking contract provide redundancy for a primary port.",
    whyItMatters: "Backup capability must be planned, available, and large enough to help."
  },
  {
    term: "Cascading failure",
    definition: "A failure that begins in one part of a system and causes additional failures in connected parts.",
    example: "A cyberattack stops port scheduling, which delays fuel deliveries, which then reduces trucking capacity.",
    whyItMatters: "The most serious consequence may happen far from the original incident."
  },
  {
    term: "Continuity",
    definition: "The ability to keep essential functions operating during and after a disruption.",
    example: "A hospital receives priority fuel and medical deliveries while lower-priority shipments are delayed.",
    whyItMatters: "Continuity focuses limited resources on the work that cannot safely stop."
  },
  {
    term: "Manual fallback",
    definition: "A tested non-automated procedure used when the normal digital system is unavailable or cannot be trusted.",
    example: "Verified paper manifests and telephone confirmation replace an offline scheduling system.",
    whyItMatters: "A fallback can keep essential work moving while a cyber incident is contained."
  }
];
