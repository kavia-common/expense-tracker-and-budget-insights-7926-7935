#!/bin/bash
cd /home/kavia/workspace/code-generation/expense-tracker-and-budget-insights-7926-7935/expense_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

