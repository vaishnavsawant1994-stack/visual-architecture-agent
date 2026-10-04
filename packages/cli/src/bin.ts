#!/usr/bin/env node
import {COMMANDS} from "./index";
const command=process.argv[2];if(!command||!COMMANDS.includes(command as never)){process.stderr.write("Usage: visual <"+COMMANDS.join("|")+">\n");process.exitCode=1}else{process.stdout.write("visual "+command+"\n");}
