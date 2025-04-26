#!/usr/bin/env node

import axios from 'axios';
import * as dotenv from 'dotenv';
import * as chalk from 'chalk';

// Load environment variables
dotenv.config();

async function main() {
  const peersEnv = process.env.PEERS;
  if (!peersEnv) {
    console.log(chalk.yellow('No peers configured. Set the PEERS environment variable.'));
    return;
  }

  const peers = peersEnv.split(',').map(p => p.trim()).filter(Boolean);
  if (peers.length === 0) {
    console.log(chalk.yellow('No valid peers found in the PEERS environment variable.'));
    return;
  }

  console.log(chalk.bold('\nChecking federation peers health:\n'));
  
  // Table header
  console.log(chalk.dim('─'.repeat(80)));
  console.log(
    chalk.bold('Peer'.padEnd(50)),
    chalk.bold('Status'.padEnd(10)),
    chalk.bold('Response Time')
  );
  console.log(chalk.dim('─'.repeat(80)));

  // Check each peer
  for (const peer of peers) {
    try {
      const startTime = Date.now();
      const url = `${peer}/federation/health`;
      const response = await axios.get(url, { timeout: 5000 });
      const duration = Date.now() - startTime;
      
      if (response.data?.ok) {
        console.log(
          peer.padEnd(50),
          chalk.green('OK'.padEnd(10)),
          `${duration}ms`
        );
      } else {
        console.log(
          peer.padEnd(50),
          chalk.red('ERROR'.padEnd(10)),
          `${duration}ms - Unexpected response`
        );
      }
    } catch (error) {
      console.log(
        peer.padEnd(50),
        chalk.red('ERROR'.padEnd(10)),
        error.code || error.message || 'Unknown error'
      );
    }
  }
  
  console.log(chalk.dim('─'.repeat(80)));
}

main().catch(error => {
  console.error('Error checking peer health:', error);
  process.exit(1);
}); 