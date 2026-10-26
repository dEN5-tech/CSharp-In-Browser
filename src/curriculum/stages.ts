import type { EducationalStage } from '../types/mono.ts';

export const EDUCATIONAL_STAGES: EducationalStage[] = [
  {
    id: 'stage-1-vs-console',
    stageNumber: 1,
    title: 'Stage 1: Visual Studio Console Application',
    subtitle: 'Standard Program.cs with static void Main(string[] args)',
    category: 'Basics',
    summary:
      'Write a standard Visual Studio Console Application template (Program.cs). Instead of custom browser wrappers, use standard C# entry points and Console.WriteLine() statements.',
    learningGoals: [
      'Write a standard C# Console Application entry point (static void Main)',
      'Use Console.WriteLine() to output data to the stream',
      'Understand how namespaces, classes, and methods are organized in Visual Studio'
    ],
    starterCode: `using System;

namespace ConsoleApp1
{
    class Program
    {
        static void Main(string[] args)
        {
            Console.WriteLine("Hello, World!");
            Console.WriteLine("Running standard Visual Studio C# code in the browser!");
        }
    }
}`,
    solutionCode: `using System;

namespace ConsoleApp1
{
    class Program
    {
        static void Main(string[] args)
        {
            Console.WriteLine("Hello, World!");
            Console.WriteLine("Running standard Visual Studio C# code in the browser!");
            Console.WriteLine($"Timestamp: {DateTime.Now:yyyy-MM-dd HH:mm:ss}");
        }
    }
}`,
    hints: [
      'Visual Studio creates "class Program" with "static void Main(string[] args)" by default.',
      'Use Console.WriteLine("...") to print lines with automatic line breaks.',
      'Console.Write("...") prints without adding a trailing newline.'
    ],
    expectedOutputSnippet: 'Hello, World!'
  },
  {
    id: 'stage-2-vs-types',
    stageNumber: 2,
    title: 'Stage 2: Variables, Loops & Console Formatting',
    subtitle: 'Strong typing, loops, and formatted console output',
    category: 'Data & Types',
    summary:
      'Implement an investment yield calculator using standard Visual Studio console patterns. Work with decimal precision, for-loops, and formatted output strings.',
    starterCode: `using System;

namespace FinancialCalculator
{
    class Program
    {
        static void Main(string[] args)
        {
            decimal principal = 10000.00m;
            decimal annualRate = 0.075m; // 7.5%
            int years = 5;

            Console.WriteLine("=== INVESTMENT GROWTH REPORT ===");
            Console.WriteLine($"Initial Principal: \${principal:N2}");
            Console.WriteLine($"Annual Interest:   {annualRate:P1}");
            Console.WriteLine("--------------------------------");

            decimal balance = principal;
            for (int year = 1; year <= years; year++)
            {
                balance += balance * annualRate;
                Console.WriteLine($"Year {year}: \${balance:N2}");
            }

            Console.WriteLine("--------------------------------");
            Console.WriteLine($"Final Balance: \${balance:N2}");
        }
    }
}`,
    solutionCode: `using System;

namespace FinancialCalculator
{
    class Program
    {
        static void Main(string[] args)
        {
            decimal principal = 10000.00m;
            decimal annualRate = 0.075m;
            int years = 5;

            Console.WriteLine("=== INVESTMENT GROWTH REPORT ===");
            Console.WriteLine($"Initial Principal: \${principal:N2}");
            Console.WriteLine($"Annual Interest:   {annualRate:P1}");
            Console.WriteLine("--------------------------------");

            decimal balance = principal;
            for (int year = 1; year <= years; year++)
            {
                balance += balance * annualRate;
                Console.WriteLine($"Year {year}: \${balance:N2}");
            }

            Console.WriteLine("--------------------------------");
            Console.WriteLine($"Final Balance: \${balance:N2}");
            Console.WriteLine($"Total Growth:  \${(balance - principal):N2}");
        }
    }
}`,
    learningGoals: [
      'Declare and use decimal primitives for exact financial math',
      'Control iterations with for loops',
      'Format output using composite string interpolation (:N2, :P1)'
    ],
    hints: [
      'Decimal literals require the "m" suffix, e.g. 10000.00m.',
      '{balance:N2} adds comma group separators and two decimal digits.',
      'Check loop bounds: year <= years runs exactly 5 iterations.'
    ],
    expectedOutputSnippet: 'Final Balance: $14,356.29'
  },
  {
    id: 'stage-3-vs-linq',
    stageNumber: 3,
    title: 'Stage 3: Collections & LINQ Queries',
    subtitle: 'Generic collections, lambda filters, and console tables',
    category: 'LINQ',
    summary:
      'Query and transform in-memory collections with System.Linq. Filter items with .Where(), sort with .OrderByDescending(), and compute statistics.',
    starterCode: `using System;
using System.Collections.Generic;
using System.Linq;

namespace UniversityGrades
{
    class Student
    {
        public string Name { get; set; }
        public int Score { get; set; }
        public string Department { get; set; }
    }

    class Program
    {
        static void Main(string[] args)
        {
            var students = new List<Student>
            {
                new Student { Name = "Alice", Score = 95, Department = "Computer Science" },
                new Student { Name = "Bob", Score = 82, Department = "Information Systems" },
                new Student { Name = "Charlie", Score = 89, Department = "Computer Science" },
                new Student { Name = "Diana", Score = 98, Department = "Software Engineering" },
                new Student { Name = "Evan", Score = 74, Department = "Information Systems" }
            };

            Console.WriteLine("=== HONOR ROLL (Score >= 85) ===");

            var honorRoll = students
                .Where(s => s.Score >= 85)
                .OrderByDescending(s => s.Score);

            foreach (var student in honorRoll)
            {
                Console.WriteLine($"[TOP] {student.Name,-10} | {student.Department,-22} | {student.Score} pts");
            }

            double averageScore = students.Average(s => s.Score);
            Console.WriteLine("-----------------------------------------------------");
            Console.WriteLine($"Class Average: {averageScore:F1} pts | Total Students: {students.Count}");
        }
    }
}`,
    solutionCode: `using System;
using System.Collections.Generic;
using System.Linq;

namespace UniversityGrades
{
    class Student
    {
        public string Name { get; set; }
        public int Score { get; set; }
        public string Department { get; set; }
    }

    class Program
    {
        static void Main(string[] args)
        {
            var students = new List<Student>
            {
                new Student { Name = "Alice", Score = 95, Department = "Computer Science" },
                new Student { Name = "Bob", Score = 82, Department = "Information Systems" },
                new Student { Name = "Charlie", Score = 89, Department = "Computer Science" },
                new Student { Name = "Diana", Score = 98, Department = "Software Engineering" },
                new Student { Name = "Evan", Score = 74, Department = "Information Systems" }
            };

            Console.WriteLine("=== HONOR ROLL (Score >= 85) ===");

            var honorRoll = students
                .Where(s => s.Score >= 85)
                .OrderByDescending(s => s.Score);

            foreach (var student in honorRoll)
            {
                Console.WriteLine($"[TOP] {student.Name,-10} | {student.Department,-22} | {student.Score} pts");
            }

            double averageScore = students.Average(s => s.Score);
            Console.WriteLine("-----------------------------------------------------");
            Console.WriteLine($"Class Average: {averageScore:F1} pts | Total Students: {students.Count}");
        }
    }
}`,
    learningGoals: [
      'Initialize generic List<T> with object initializers',
      'Filter collections using LINQ .Where() and .OrderByDescending()',
      'Format tabular console columns with padding syntax ({student.Name,-10})'
    ],
    hints: [
      'Make sure "using System.Linq;" and "using System.Collections.Generic;" are included.',
      'The expression {student.Name,-10} pads the string to 10 characters left-aligned.',
      'Average() computes the arithmetic mean directly.'
    ],
    expectedOutputSnippet: '=== HONOR ROLL (Score >= 85) ==='
  },
  {
    id: 'stage-4-vs-oop',
    stageNumber: 4,
    title: 'Stage 4: Object-Oriented Programming & Interfaces',
    subtitle: 'Custom classes, polymorphism, and console reporting',
    category: 'OOP',
    summary:
      'Design an object-oriented domain hierarchy with an interface (IDevice) and multiple implementing classes (Server, Workstation). Iterate polymorphically and output diagnostic logs.',
    starterCode: `using System;
using System.Collections.Generic;

namespace InfrastructureMonitor
{
    public interface IDevice
    {
        string Hostname { get; }
        string GetDiagnostics();
    }

    public class ServerNode : IDevice
    {
        public string Hostname { get; }
        public int ActiveConnections { get; }

        public ServerNode(string hostname, int connections)
        {
            Hostname = hostname;
            ActiveConnections = connections;
        }

        public string GetDiagnostics() => $"[SERVER] {Hostname,-16} | Connections: {ActiveConnections} | Status: Healthy";
    }

    public class DatabaseNode : IDevice
    {
        public string Hostname { get; }
        public double QueryLatencyMs { get; }

        public DatabaseNode(string hostname, double latency)
        {
            Hostname = hostname;
            QueryLatencyMs = latency;
        }

        public string GetDiagnostics() => $"[DB]     {Hostname,-16} | Latency: {QueryLatencyMs:F1} ms    | Status: Active";
    }

    class Program
    {
        static void Main(string[] args)
        {
            var cluster = new List<IDevice>
            {
                new ServerNode("edge-srv-01", 1420),
                new ServerNode("edge-srv-02", 980),
                new DatabaseNode("db-primary", 2.4),
                new DatabaseNode("db-replica-eu", 18.7)
            };

            Console.WriteLine("=== DATA CENTER TELEMETRY REPORT ===");
            foreach (var device in cluster)
            {
                Console.WriteLine(device.GetDiagnostics());
            }

            Console.WriteLine("------------------------------------");
            Console.WriteLine($"Monitored Nodes: {cluster.Count}");
        }
    }
}`,
    solutionCode: `using System;
using System.Collections.Generic;

namespace InfrastructureMonitor
{
    public interface IDevice
    {
        string Hostname { get; }
        string GetDiagnostics();
    }

    public class ServerNode : IDevice
    {
        public string Hostname { get; }
        public int ActiveConnections { get; }

        public ServerNode(string hostname, int connections)
        {
            Hostname = hostname;
            ActiveConnections = connections;
        }

        public string GetDiagnostics() => $"[SERVER] {Hostname,-16} | Connections: {ActiveConnections} | Status: Healthy";
    }

    public class DatabaseNode : IDevice
    {
        public string Hostname { get; }
        public double QueryLatencyMs { get; }

        public DatabaseNode(string hostname, double latency)
        {
            Hostname = hostname;
            QueryLatencyMs = latency;
        }

        public string GetDiagnostics() => $"[DB]     {Hostname,-16} | Latency: {QueryLatencyMs:F1} ms    | Status: Active";
    }

    class Program
    {
        static void Main(string[] args)
        {
            var cluster = new List<IDevice>
            {
                new ServerNode("edge-srv-01", 1420),
                new ServerNode("edge-srv-02", 980),
                new DatabaseNode("db-primary", 2.4),
                new DatabaseNode("db-replica-eu", 18.7)
            };

            Console.WriteLine("=== DATA CENTER TELEMETRY REPORT ===");
            foreach (var device in cluster)
            {
                Console.WriteLine(device.GetDiagnostics());
            }

            Console.WriteLine("------------------------------------");
            Console.WriteLine($"Monitored Nodes: {cluster.Count}");
        }
    }
}`,
    learningGoals: [
      'Define clean contracts with interfaces',
      'Implement interfaces across multiple domain models',
      'Iterate heterogeneous object collections polymorphically'
    ],
    hints: [
      'Each class implements GetDiagnostics() according to its own requirements.',
      'List<IDevice> can hold both ServerNode and DatabaseNode instances.',
      'Polymorphism executes the correct subclass method at runtime.'
    ],
    expectedOutputSnippet: '=== DATA CENTER TELEMETRY REPORT ==='
  },
  {
    id: 'stage-5-vs-json',
    stageNumber: 5,
    title: 'Stage 5: JSON Serialization with Newtonsoft.Json',
    subtitle: 'Parsing and emitting JSON records in a console app',
    category: 'JSON & Async',
    summary:
      'Process JSON payloads using the standard Newtonsoft.Json library. Parse an array of incoming ledger transactions and output an audited balance summary.',
    starterCode: `using System;
using System.Collections.Generic;
using Newtonsoft.Json;

namespace LedgerProcessor
{
    public class OrderItem
    {
        public string Sku { get; set; }
        public string Title { get; set; }
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
    }

    class Program
    {
        static void Main(string[] args)
        {
            string payload = @"[
                { 'Sku': 'BOOK-CSHARP', 'Title': 'C# 7.0 In A Nutshell', 'Quantity': 2, 'UnitPrice': 45.00 },
                { 'Sku': 'DEV-MOUSE',   'Title': 'Ergonomic Mouse',      'Quantity': 1, 'UnitPrice': 79.99 },
                { 'Sku': 'DEV-KEYBOARD','Title': 'Mechanical Keyboard',  'Quantity': 1, 'UnitPrice': 129.50 }
            ]";

            var items = JsonConvert.DeserializeObject<List<OrderItem>>(payload);

            Console.WriteLine("=== INVOICE BREAKDOWN ===");
            decimal subtotal = 0;

            foreach (var item in items)
            {
                decimal lineTotal = item.Quantity * item.UnitPrice;
                subtotal += lineTotal;
                Console.WriteLine($"{item.Title,-24} | Qty: {item.Quantity} | Unit: \${item.UnitPrice:N2} | Total: \${lineTotal:N2}");
            }

            decimal tax = subtotal * 0.08m; // 8% sales tax
            decimal grandTotal = subtotal + tax;

            Console.WriteLine("-------------------------------------------------------------------");
            Console.WriteLine($"Subtotal:    \${subtotal:N2}");
            Console.WriteLine($"Tax (8%):    \${tax:N2}");
            Console.WriteLine($"Grand Total: \${grandTotal:N2}");
        }
    }
}`,
    solutionCode: `using System;
using System.Collections.Generic;
using Newtonsoft.Json;

namespace LedgerProcessor
{
    public class OrderItem
    {
        public string Sku { get; set; }
        public string Title { get; set; }
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
    }

    class Program
    {
        static void Main(string[] args)
        {
            string payload = @"[
                { 'Sku': 'BOOK-CSHARP', 'Title': 'C# 7.0 In A Nutshell', 'Quantity': 2, 'UnitPrice': 45.00 },
                { 'Sku': 'DEV-MOUSE',   'Title': 'Ergonomic Mouse',      'Quantity': 1, 'UnitPrice': 79.99 },
                { 'Sku': 'DEV-KEYBOARD','Title': 'Mechanical Keyboard',  'Quantity': 1, 'UnitPrice': 129.50 }
            ]";

            var items = JsonConvert.DeserializeObject<List<OrderItem>>(payload);

            Console.WriteLine("=== INVOICE BREAKDOWN ===");
            decimal subtotal = 0;

            foreach (var item in items)
            {
                decimal lineTotal = item.Quantity * item.UnitPrice;
                subtotal += lineTotal;
                Console.WriteLine($"{item.Title,-24} | Qty: {item.Quantity} | Unit: \${item.UnitPrice:N2} | Total: \${lineTotal:N2}");
            }

            decimal tax = subtotal * 0.08m;
            decimal grandTotal = subtotal + tax;

            Console.WriteLine("-------------------------------------------------------------------");
            Console.WriteLine($"Subtotal:    \${subtotal:N2}");
            Console.WriteLine($"Tax (8%):    \${tax:N2}");
            Console.WriteLine($"Grand Total: \${grandTotal:N2}");
        }
    }
}`,
    learningGoals: [
      'Deserialize JSON payloads into strongly typed C# models',
      'Compute line-item financial metrics in a loop',
      'Print formatted summaries with currency formatting'
    ],
    hints: [
      'JsonConvert.DeserializeObject<T>() is the primary method for parsing JSON.',
      'Properties match JSON keys case-insensitively.',
      'Remember decimal literals require "m" suffix for tax rates.'
    ],
    expectedOutputSnippet: 'Grand Total: $323.45'
  },
  {
    id: 'stage-6-vs-async',
    stageNumber: 6,
    title: 'Stage 6: Asynchronous Main & Task Pipelines',
    subtitle: 'static async Task Main(string[] args) & Task.WhenAll',
    category: 'JSON & Async',
    summary:
      'C# 7.1 introduced async Main entry points: static async Task Main(string[] args). Execute asynchronous tasks and await them concurrently right inside WebAssembly.',
    starterCode: `using System;
using System.Threading.Tasks;

namespace AsyncPipeline
{
    class Program
    {
        static async Task Main(string[] args)
        {
            Console.WriteLine("Starting asynchronous tasks in WebAssembly...");
            Console.WriteLine("---------------------------------------------");

            var task1 = FetchSensorAsync("Sensor-Alpha", 120);
            var task2 = FetchSensorAsync("Sensor-Beta", 80);
            var task3 = FetchSensorAsync("Sensor-Gamma", 150);

            string[] results = await Task.WhenAll(task1, task2, task3);

            foreach (var r in results)
            {
                Console.WriteLine(r);
            }

            Console.WriteLine("---------------------------------------------");
            Console.WriteLine("All async tasks completed successfully.");
        }

        static async Task<string> FetchSensorAsync(string sensorName, int latencyMs)
        {
            await Task.Delay(latencyMs);
            return $"[OK] {sensorName,-14} responded after {latencyMs} ms delay";
        }
    }
}`,
    solutionCode: `using System;
using System.Threading.Tasks;

namespace AsyncPipeline
{
    class Program
    {
        static async Task Main(string[] args)
        {
            Console.WriteLine("Starting asynchronous tasks in WebAssembly...");
            Console.WriteLine("---------------------------------------------");

            var task1 = FetchSensorAsync("Sensor-Alpha", 120);
            var task2 = FetchSensorAsync("Sensor-Beta", 80);
            var task3 = FetchSensorAsync("Sensor-Gamma", 150);

            string[] results = await Task.WhenAll(task1, task2, task3);

            foreach (var r in results)
            {
                Console.WriteLine(r);
            }

            Console.WriteLine("---------------------------------------------");
            Console.WriteLine("All async tasks completed successfully.");
        }

        static async Task<string> FetchSensorAsync(string sensorName, int latencyMs)
        {
            await Task.Delay(latencyMs);
            return $"[OK] {sensorName,-14} responded after {latencyMs} ms delay";
        }
    }
}`,
    learningGoals: [
      'Use C# 7.1 "static async Task Main(string[] args)" entry point',
      'Coordinate multiple concurrent operations using Task.WhenAll()',
      'Use async / await syntax without blocking the thread'
    ],
    hints: [
      'static async Task Main is supported in C# 7.1+.',
      'Task.WhenAll awaits all tasks concurrently and returns an array of results.',
      'Task.Delay simulates asynchronous non-blocking work.'
    ],
    expectedOutputSnippet: 'All async tasks completed successfully.'
  }
];
