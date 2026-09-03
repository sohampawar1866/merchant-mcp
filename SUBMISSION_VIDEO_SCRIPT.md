# Razorpay Buildathon 2026 - Official Video Demo Script
### **AgenticCheckout: Unified Agentic Commerce Gateway powered by Razorpay**
**Track 01: AI Growth & Agentic Commerce | Target Duration: 2 Minutes**

---

## Video Breakdown

| Timestamp | Screen Display | Narration & Key Talking Points |
|---|---|---|
| **0:00 - 0:25** | Claude Desktop / Terminal showing MCP connection | *"Hello judges! Welcome to AgenticCheckout - the Unified Agentic Commerce Gateway powered by Razorpay. Today, AI buyer agents are transforming e-commerce, but merchants face a dilemma: uncontrolled discount erosion and Indian RBI 2FA compliance. AgenticCheckout bridges this with a unified Go MCP gateway connecting buyer agents directly to Razorpay."* |
| **0:25 - 0:55** | Phone Mockup (:3002) - Fast-Path Test | *"Here is our Customer Phone Simulator representing NPCI UPI Circle. The human delegates a ₹15,000 monthly allowance and a ₹2,000 auto-approval cap to Claude. Watch what happens when Claude buys an ₹899 Laptop Stand: because it's under the cap, it executes via our autonomous fast-path in under 10 milliseconds! An ACID double-entry ledger debits the wallet, and Claude receives a rich, itemized ASCII tax receipt in chat."* |
| **0:55 - 1:30** | Phone Mockup (:3002) -> Razorpay 2FA -> Invoice (:3000) | *"Now watch high-value purchases. Claude tries to buy a ₹12,999 4K Projector. It exceeds the auto-cap. Instead of failing, the gateway enforces RBI compliance with a Razorpay Step-Up 2FA payment link. The customer approves it with their UPI MPIN. Notice the magic: Razorpay automatically redirects them to `/order/success`! No awkward chat polling, no broken loops - just an instant celebratory confirmation with an official 18% GST Tax Invoice and BlueDart tracking."* |
| **1:30 - 1:50** | Merchant Control Plane (:3000) & Benchmarks | *"On the merchant control plane, store owners enjoy 100% margin defense: private floor prices are never leaked, dynamic pricing blocks discount abuse, and automated upsell campaigns boost AOV. In our benchmarks, composite multi-tenant indexes deliver sub-0.3 millisecond catalog queries - 17x faster than our 5ms SLA!"* |
| **1:50 - 2:00** | Desktop Control Center & Closing | *"With cross-platform desktop control centers for macOS, Windows, and Linux, and 14 production MCP tools, AgenticCheckout is ready to power the next generation of agentic commerce in India. Thank you!"* |

---

## Recording Checklist
1. **Window 1 (Left)**: Customer Phone Simulator ([`http://localhost:3002`](http://localhost:3002))
2. **Window 2 (Right)**: Merchant Control Plane ([`http://localhost:3000`](http://localhost:3000))
3. **Window 3 (Background)**: Printable GST Tax Invoice ([`http://localhost:3000/order/success`](http://localhost:3000/order/success))
4. **Terminal**: Showing Go unit test results: `0.28ms query latency`
