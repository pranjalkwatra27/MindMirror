// DSA MCQ Question Bank — 56 questions across 7 topics

const QUESTIONS = [
  // ── Arrays ────────────────────────────────────────────────────────────────
  { id:'arr-1', topic:'Arrays', difficulty:'Easy',   company:'Google',    question:'What is the time complexity of binary search on a sorted array of n elements?', options:['O(n)','O(log n)','O(n log n)','O(1)'], answer:1, explanation:'Binary search halves the search space each step. After k steps n/2^k=1, so k=log₂(n). Time: O(log n).' },
  { id:'arr-2', topic:'Arrays', difficulty:'Medium', company:'Amazon',    question:"Kadane's algorithm solves which classic problem?", options:['Maximum subarray sum','Minimum subarray sum','Subarray with given sum','Longest increasing subarray'], answer:0, explanation:"Kadane's scans once, tracking the max sum ending at each index. Runs in O(n) — optimal for max contiguous subarray." },
  { id:'arr-3', topic:'Arrays', difficulty:'Medium', company:'Microsoft', question:'The Two-Pointer technique is most effectively applied on:', options:['Only linked lists','Sorted arrays or strings','Only trees','Any unsorted array'], answer:1, explanation:'Two-pointer works on sorted arrays/strings; moving pointers inward or forward lets you find pairs/subarrays in O(n) instead of O(n²).' },
  { id:'arr-4', topic:'Arrays', difficulty:'Hard',   company:'Meta',      question:'What approach achieves O(n) time AND O(1) space for "Trapping Rainwater"?', options:['Brute force O(n²)','Precompute left/right max arrays O(n) O(n)','Two-pointer O(n) O(1) space','Monotonic stack O(n)'], answer:2, explanation:'Two-pointer: maintain l/r pointers and track running max from each side. The side with the smaller max provides the bounded height. O(n) time, O(1) space.' },
  { id:'arr-5', topic:'Arrays', difficulty:'Medium', company:'Apple',     question:'Dutch National Flag algorithm (3-way partition) is used to sort arrays containing:', options:['0s and 1s only','0s, 1s, and 2s','Any two distinct values','Any unsorted integers'], answer:1, explanation:"Dijkstra's algorithm partitions an array of 0s, 1s, 2s in one pass using three pointers: low, mid, high. O(n) time, O(1) space." },
  { id:'arr-6', topic:'Arrays', difficulty:'Medium', company:'Uber',      question:'Sliding Window reduces time complexity by:', options:['Sorting the subarray each time','Maintaining a window that expands/shrinks instead of recomputing from scratch','Using binary search inside the window','Recursively solving overlapping subproblems'], answer:1, explanation:'Instead of recomputing each window from scratch in O(k), sliding window adds/removes one element per step, bringing total work from O(n·k) to O(n).' },
  { id:'arr-7', topic:'Arrays', difficulty:'Easy',   company:'Netflix',   question:'Prefix sum array reduces a range sum query [l, r] from O(n) to:', options:['O(log n)','O(1)','O(√n)','O(n/2)'], answer:1, explanation:'prefix[i] = sum of first i elements. Range[l,r] = prefix[r] − prefix[l−1]. One lookup → O(1) per query after O(n) preprocessing.' },
  { id:'arr-8', topic:'Arrays', difficulty:'Hard',   company:'Google',    question:'Boyer-Moore Voting Algorithm finds:', options:['Majority element in O(n log n)','Majority element (appearing > n/2 times) in O(n) time O(1) space','Any frequent element in O(n)','Median in O(n)'], answer:1, explanation:'Boyer-Moore cancels out pairs of different elements. The surviving candidate is the majority element. One scan O(n), one variable O(1).' },

  // ── Linked List ───────────────────────────────────────────────────────────
  { id:'ll-1', topic:'Linked List', difficulty:'Medium', company:'Amazon',    question:"Floyd's Cycle Detection algorithm uses:", options:['One fast pointer and one slow pointer','Two fast pointers','A hash set to track visited nodes','Stack-based DFS'], answer:0, explanation:"Floyd's (tortoise & hare): slow moves 1 step, fast moves 2. They meet inside the cycle. If fast reaches null, no cycle exists." },
  { id:'ll-2', topic:'Linked List', difficulty:'Hard',   company:'Google',    question:'LRU Cache with O(1) get and put is implemented using:', options:['Array + Binary Search','HashMap + Doubly Linked List','Stack + Queue','Min-Heap + HashMap'], answer:1, explanation:'HashMap gives O(1) lookup; doubly linked list gives O(1) insertion/deletion for MRU-end and LRU-end eviction.' },
  { id:'ll-3', topic:'Linked List', difficulty:'Easy',   company:'Microsoft', question:'Time complexity of reversing a singly linked list iteratively:', options:['O(n²)','O(log n)','O(n)','O(1)'], answer:2, explanation:'Visit each node once to flip next pointer: O(n) time, O(1) space.' },
  { id:'ll-4', topic:'Linked List', difficulty:'Easy',   company:'Meta',      question:'Finding the middle of a linked list in one pass uses:', options:['Count all nodes first','Fast (2-step) and slow (1-step) pointer','Stack then pop half','Recursion with counter'], answer:1, explanation:'When fast reaches the end, slow is at the middle. Single pass O(n), O(1) extra space.' },
  { id:'ll-5', topic:'Linked List', difficulty:'Medium', company:'Uber',      question:"After Floyd's cycle detection, how do you find the cycle's start node?", options:['Move fast pointer to head; advance both two steps','Move fast pointer to head; advance both one step at a time','Use a hash set from the beginning','Move slow pointer to head; advance both one step'], answer:3, explanation:"After meeting inside the cycle: reset one pointer to head, advance both one step. They meet exactly at the cycle start — a consequence of Floyd's math proof." },
  { id:'ll-6', topic:'Linked List', difficulty:'Medium', company:'Apple',     question:'Merging two sorted linked lists of sizes m and n has time complexity:', options:['O(m·n)','O(m + n)','O(m log n)','O((m+n) log(m+n))'], answer:1, explanation:'Compare and link nodes one at a time until both lists are exhausted: O(m + n).' },
  { id:'ll-7', topic:'Linked List', difficulty:'Medium', company:'Netflix',   question:'To remove the Nth node from the end in one pass use:', options:['Hash map of indices','Two pointers N nodes apart','Stack, then pop N times','Count length then retraverse'], answer:1, explanation:'Advance the front pointer N steps, then move both together. When front hits null, back is at the target. O(n) single pass.' },
  { id:'ll-8', topic:'Linked List', difficulty:'Hard',   company:'Google',    question:'Deep copying a linked list with random pointers efficiently requires:', options:['O(n²) — traverse for each random pointer','O(n) — HashMap of old→new nodes','O(n) — weave cloned nodes in-place','Either B or C are optimal'], answer:3, explanation:'HashMap approach (O(n) extra space) and in-place node interleaving (O(1) extra space) both run in O(n) time. Pick based on space constraint.' },

  // ── Stacks ────────────────────────────────────────────────────────────────
  { id:'stk-1', topic:'Stacks', difficulty:'Medium', company:'Amazon',    question:'Monotonic stack is most useful for:', options:['Sorting arrays in-place','Finding next greater/smaller element for each position in O(n)','Balancing nested brackets','Evaluating arithmetic expressions'], answer:1, explanation:'Maintain a stack in increasing or decreasing order. Each element is pushed/popped at most once → O(n) amortized for all next-greater queries.' },
  { id:'stk-2', topic:'Stacks', difficulty:'Medium', company:'Google',    question:'MinStack achieves O(1) getMin() by:', options:['Sorting on every push','Maintaining an auxiliary stack that tracks the current minimum at each depth','Storing a single global min variable','Binary search on stack elements'], answer:1, explanation:'Auxiliary stack stores (current min) at each level. On push: push max(val, aux.top) to aux too. Pop both stacks together.' },
  { id:'stk-3', topic:'Stacks', difficulty:'Hard',   company:'Microsoft', question:'"Largest Rectangle in Histogram" is solved in O(n) using:', options:['Brute force O(n²)','Monotonic increasing stack','Divide and conquer O(n log n)','DP table O(n)'], answer:1, explanation:'Monotonic increasing stack: when a shorter bar is encountered, pop and compute area using the popped bar as height and current index as right boundary. O(n).' },
  { id:'stk-4', topic:'Stacks', difficulty:'Easy',   company:'Meta',      question:'Balanced parentheses validation checks:', options:['Equal count of open and close brackets is sufficient','Every closing bracket matches the most recent unmatched opening bracket','Any nesting order is valid if counts match','Stack depth equals maximum nesting level'], answer:1, explanation:'Count matching alone fails for ")(" — you must ensure each closing bracket corresponds to the innermost unmatched opener via stack.' },
  { id:'stk-5', topic:'Stacks', difficulty:'Medium', company:'Apple',     question:'Evaluating a postfix (RPN) expression requires:', options:['Two stacks: operand + operator','One stack for operands only','One stack for operators only','No stack — linear scan suffices'], answer:1, explanation:'Push operands. On operator, pop two, apply, push result. Final top is the answer. One operand stack needed.' },
  { id:'stk-6', topic:'Stacks', difficulty:'Medium', company:'Uber',      question:'"Daily Temperatures" (days until warmer) solved in O(n) using:', options:['Brute-force nested loops O(n²)','Priority queue (min-heap)','Monotonic decreasing stack of indices','Prefix max array'], answer:2, explanation:'Stack stores indices at decreasing temperatures. When a warmer day arrives, pop indices and record the gap. Each index pushed/popped once → O(n).' },
  { id:'stk-7', topic:'Stacks', difficulty:'Medium', company:'Netflix',   question:'Decode String "3[a2[bc]]" → "abcbcabcbcabcbc" uses:', options:['Pure recursion only','Two stacks: one for counts, one for partial strings','Queue-based BFS','Greedy left-to-right scan'], answer:1, explanation:'Count stack stores repeat numbers; string stack stores partial results before each bracket. On "]", pop, repeat current segment, append to previous string.' },

  // ── Trees ─────────────────────────────────────────────────────────────────
  { id:'tre-1', topic:'Trees', difficulty:'Easy',   company:'Google',    question:'BST search is O(log n) average. When does it degrade to O(n)?', options:['When n > 1000','When BST degenerates into a skewed linked list','When duplicates exist','When using recursive search'], answer:1, explanation:'Inserting sorted input into a BST creates a path — every node has only a right child. Height = n, search = O(n).' },
  { id:'tre-2', topic:'Trees', difficulty:'Medium', company:'Amazon',    question:'Which AVL imbalance case requires a double rotation?', options:['Left-Left (LL)','Right-Right (RR)','Left-Right (LR) or Right-Left (RL)','Any imbalance of height ≥ 2'], answer:2, explanation:'LL → single right rotation. RR → single left rotation. LR → left-rotate child then right-rotate root (double). RL → right-rotate child then left-rotate root.' },
  { id:'tre-3', topic:'Trees', difficulty:'Medium', company:'Microsoft', question:'A Trie (prefix tree) achieves prefix search in:', options:['O(n) where n is number of words','O(L) where L is prefix length','O(log n)','O(n·L) worst case'], answer:1, explanation:'Each node represents one character. Searching a prefix of length L traverses exactly L nodes regardless of dictionary size → O(L).' },
  { id:'tre-4', topic:'Trees', difficulty:'Hard',   company:'Meta',      question:'Lowest Common Ancestor (LCA) in a binary tree: the O(n) single-DFS approach returns:', options:['Left child if found there','Right child if found there','The node itself when both targets exist in different subtrees','Null always'], answer:2, explanation:'DFS: if current node matches either target or is null, return it. LCA is the first node whose left and right DFS both return non-null.' },
  { id:'tre-5', topic:'Trees', difficulty:'Easy',   company:'Uber',      question:'Level-order traversal of a binary tree uses:', options:['Stack (LIFO)','Queue (FIFO)','Priority Queue','Two stacks'], answer:1, explanation:'BFS with a queue: enqueue root, then each dequeued node enqueues its children. Processes level-by-level.' },
  { id:'tre-6', topic:'Trees', difficulty:'Hard',   company:'Google',    question:'Morris Traversal performs inorder traversal with:', options:['O(n) extra stack space','O(log n) recursion depth','O(1) extra space by temporarily modifying tree links','O(n) queue space'], answer:2, explanation:'Morris creates temporary right-pointer "threads" from inorder predecessor to current node, allowing backtracking without a stack. These threads are removed after use.' },
  { id:'tre-7', topic:'Trees', difficulty:'Hard',   company:'Apple',     question:'Segment Tree supports range sum/min/max queries and updates in:', options:['O(1) query, O(n) update','O(log n) both query and update','O(n) query, O(1) update','O(n log n) both'], answer:1, explanation:'A segment tree stores aggregates over segments. Querying or updating a range narrows the tree by half each level → O(log n) per operation.' },
  { id:'tre-8', topic:'Trees', difficulty:'Medium', company:'Netflix',   question:'Diameter of a binary tree is computed optimally in:', options:['O(n²) via two separate DFS per node','O(n) single DFS tracking height per node','O(n log n) divide and conquer','O(n²) always'], answer:1, explanation:'Single DFS: for each node, diameter through it = leftHeight + rightHeight. Update global max incrementally. One pass → O(n).' },

  // ── Dynamic Programming ───────────────────────────────────────────────────
  { id:'dp-1', topic:'Dynamic Programming', difficulty:'Easy',   company:'Amazon',    question:'Space-optimal Fibonacci uses only:', options:['O(n) array','O(log n) stack','O(1) — two rolling variables','O(n) memoization map'], answer:2, explanation:'fib(n) depends only on fib(n-1) and fib(n-2). Track two variables, update in a loop. O(n) time, O(1) space.' },
  { id:'dp-2', topic:'Dynamic Programming', difficulty:'Medium', company:'Google',    question:'Greedy fails for Coin Change when:', options:['Coins are sorted','Coin set is non-canonical (e.g., {1,3,4} for amount 6)','Coins contain 1','Amount is even'], answer:1, explanation:'For {1,3,4} and amount=6: greedy picks 4+1+1=3 coins; DP finds 3+3=2 coins. Greedy only works for canonical coin systems like US denominations.' },
  { id:'dp-3', topic:'Dynamic Programming', difficulty:'Medium', company:'Microsoft', question:"When characters match in LCS (s1[i]==s2[j]), the recurrence is:", options:['dp[i][j] = dp[i-1][j-1]','dp[i][j] = 1 + dp[i-1][j-1]','dp[i][j] = max(dp[i-1][j], dp[i][j-1])','dp[i][j] = 1 + max(dp[i-1][j], dp[i][j-1])'], answer:1, explanation:'Matching characters extend the LCS of shortened prefixes. When mismatched: dp[i][j] = max(dp[i-1][j], dp[i][j-1]).' },
  { id:'dp-4', topic:'Dynamic Programming', difficulty:'Hard',   company:'Meta',      question:'Space-optimized 0/1 Knapsack iterates its 1D array:', options:['Left to right (standard)','Right to left (prevents reuse of same item)','Either direction is equivalent','In two alternating passes'], answer:1, explanation:'Left-to-right on a 1D array allows an item to be used multiple times (unbounded knapsack). Right-to-left ensures each item is considered at most once.' },
  { id:'dp-5', topic:'Dynamic Programming', difficulty:'Medium', company:'Apple',     question:'Edit Distance (Levenshtein) allows exactly these three operations:', options:['Insert, delete, swap adjacent','Insert, delete, replace','Replace, split, merge','Insert, copy, transpose'], answer:1, explanation:'dp[i][j] = min of: delete (dp[i-1][j]+1), insert (dp[i][j-1]+1), replace (dp[i-1][j-1] + (chars differ ? 1 : 0)).' },
  { id:'dp-6', topic:'Dynamic Programming', difficulty:'Hard',   company:'Uber',      question:'Longest Increasing Subsequence (LIS) with O(n log n) uses:', options:['2D DP table','Greedy with binary search on a tails array','BFS on a DAG','Segment tree + DP'], answer:1, explanation:'Maintain a "tails" array where tails[i] is the smallest tail of all increasing subsequences of length i+1. Binary search to update in O(log n) per element.' },
  { id:'dp-7', topic:'Dynamic Programming', difficulty:'Hard',   company:'Netflix',   question:'Matrix Chain Multiplication DP finds:', options:['The actual product matrix','Minimum scalar multiplications needed','Maximum result values','Optimal matrix dimensions'], answer:1, explanation:'dp[i][j] = minimum cost to multiply matrices i…j. Split at every k between i and j; take min. O(n³) time, O(n²) space.' },
  { id:'dp-8', topic:'Dynamic Programming', difficulty:'Medium', company:'Google',    question:'Partition Equal Subset Sum reduces to:', options:['LCS on two halves','0/1 Knapsack with target = totalSum / 2','Coin Change with coins = array elements','Fibonacci-style recurrence'], answer:1, explanation:'If totalSum is odd → impossible. Otherwise find a subset summing to totalSum/2. This is 0/1 knapsack with capacity = totalSum/2 and items = array elements.' },
  { id:'dp-9', topic:'Dynamic Programming', difficulty:'Easy',   company:'Amazon',    question:'In Climbing Stairs (1 or 2 steps at a time), the number of ways to reach step n equals:', options:['n!','2^n','Fibonacci(n + 1)','n * (n - 1) / 2'], answer:2, explanation:'To reach step n, you can either jump from step n-1 or n-2. Thus ways(n) = ways(n-1) + ways(n-2), matching the Fibonacci recurrence.' },
  { id:'dp-10', topic:'Dynamic Programming', difficulty:'Medium', company:'Microsoft', question:'House Robber I (adjacent houses cannot be robbed) has the recurrence:', options:['dp[i] = dp[i-1] + nums[i]','dp[i] = max(dp[i-1], dp[i-2] + nums[i])','dp[i] = max(dp[i-1], dp[i-2])','dp[i] = dp[i-2] + nums[i]'], answer:1, explanation:'At house i, you either skip it (keep dp[i-1]) or rob it (add nums[i] to dp[i-2]). The optimal value is the maximum of the two.' },
  { id:'dp-11', topic:'Dynamic Programming', difficulty:'Medium', company:'Meta',      question:'Unique Paths in an m x n grid (only moving Right or Down) is solved in O(n) space by:', options:['Recursive DFS with no cache','Rolling 1D array of size n with dp[j] += dp[j-1]','Matrix multiplication','Greedy priority queue'], answer:1, explanation:'Since dp[i][j] only depends on dp[i-1][j] (current cell before update) and dp[i][j-1] (previous column), a 1D array of size n is sufficient.' },
  { id:'dp-12', topic:'Dynamic Programming', difficulty:'Hard',   company:'Google',    question:'"Burst Balloons" is classified as which type of DP technique?', options:['1D State Compression','Interval / Range DP','Digit DP','Bitmask DP'], answer:1, explanation:'Burst Balloons is solved by defining dp[i][j] as the max coins gained from bursting all balloons strictly between index i and j (Interval DP), iterating by subarray length.' },
  { id:'dp-13', topic:'Dynamic Programming', difficulty:'Hard',   company:'Apple',     question:'Traveling Salesperson Problem (TSP) with n ≤ 20 vertices is solved optimally using:', options:['O(n!) Brute Force','Bitmask DP in O(n² · 2ⁿ) time','Greedy Nearest Neighbor','Kruskal Algorithm'], answer:1, explanation:'Held-Karp algorithm uses Bitmask DP where dp[mask][u] represents the minimum cost visiting subset of vertices in mask ending at u. Time: O(n² · 2ⁿ), Space: O(n · 2ⁿ).' },
  { id:'dp-14', topic:'Dynamic Programming', difficulty:'Medium', company:'Amazon',    question:'Target Sum (assign + or - to each number to reach target S) transforms mathematically into:', options:['Longest Common Subsequence','Subset Sum where positive subset P = (totalSum + target) / 2','Shortest Path BFS','Graph 2-Coloring'], answer:1, explanation:'Sum(P) - Sum(N) = S and Sum(P) + Sum(N) = Total. Adding gives 2 * Sum(P) = Total + S, which reduces to classic 0/1 Subset Sum.' },
  { id:'dp-15', topic:'Dynamic Programming', difficulty:'Hard',   company:'Uber',      question:'Longest Palindromic Subsequence of string s can be solved directly by computing:', options:['KMP prefix table on s','LCS between s and reverse(s)','Monotonic Stack on characters','Suffix Automaton'], answer:1, explanation:'The Longest Palindromic Subsequence of string s is identically the Longest Common Subsequence (LCS) between s and its reverse reverse(s).' },
  { id:'dp-16', topic:'Dynamic Programming', difficulty:'Hard',   company:'Netflix',   question:'Maximum Product Subarray handles negative numbers optimally by tracking:', options:['Only running sum','Both running minimum and running maximum at each index','Bitwise XOR values','Positive prefix products only'], answer:1, explanation:'Multiplying by a negative number can turn a minimum into a maximum. Maintaining both running min and max at each step ensures correct transitions in O(n) time O(1) space.' },


  // ── Graphs ────────────────────────────────────────────────────────────────
  { id:'gph-1', topic:'Graphs', difficulty:'Easy',   company:'Amazon',    question:'BFS guarantees shortest path (fewest edges) only in:', options:['Weighted directed graphs','Unweighted graphs','Graphs with negative weights','DAGs only'], answer:1, explanation:'BFS explores level-by-level; first visit to a node is via fewest edges. For weighted graphs use Dijkstra (non-negative) or Bellman-Ford (negative).' },
  { id:'gph-2', topic:'Graphs', difficulty:'Medium', company:'Google',    question:"Dijkstra's algorithm fails when the graph has:", options:['Cycles','Disconnected components','Negative edge weights','More than 10⁶ nodes'], answer:2, explanation:"Dijkstra finalizes shortest-path estimates greedily. A negative edge after a finalized node could produce a shorter path, violating the greedy assumption." },
  { id:'gph-3', topic:'Graphs', difficulty:'Medium', company:'Microsoft', question:'Bellman-Ford detects negative cycles and has time complexity:', options:['O(V + E)','O(V · E)','O(E log V)','O(V²)'], answer:1, explanation:'Relax all E edges V−1 times = O(V·E). One more pass that still relaxes an edge indicates a negative cycle.' },
  { id:'gph-4', topic:'Graphs', difficulty:'Medium', company:'Meta',      question:'Union-Find with path compression + union by rank achieves:', options:['O(log n) per op','O(n) per op','Amortized O(α(n)) ≈ O(1) per op','O(n log n) total for n ops'], answer:2, explanation:'α(n) is the inverse Ackermann function — grows slower than log*(n). For all practical n it is ≤ 4.' },
  { id:'gph-5', topic:'Graphs', difficulty:'Medium', company:'Apple',     question:'Topological sort is only possible on:', options:['Undirected graphs','Directed Acyclic Graphs (DAGs)','Complete graphs','Trees only'], answer:1, explanation:'A cycle implies a node must come before itself — contradicting a linear order. DAG ↔ topological order exists (Kahn\'s or DFS with finish-time stack).' },
  { id:'gph-6', topic:'Graphs', difficulty:'Hard',   company:'Uber',      question:"Kruskal's MST algorithm adds the next edge that:", options:['Connects the cheapest vertex to the growing tree','Is the globally smallest and does NOT form a cycle','Completes a path from source to all vertices','Relaxes the highest-weight edge'], answer:1, explanation:"Sort edges by weight; use Union-Find to skip edges that would form a cycle. Add the rest. O(E log E). Differs from Prim's which grows from one vertex." },
  { id:'gph-7', topic:'Graphs', difficulty:'Medium', company:'Netflix',   question:'A graph is bipartite if and only if:', options:['It has an even number of nodes','It contains no odd-length cycles','Every node has an even degree','It is a tree'], answer:1, explanation:'Bipartite ↔ 2-colorable. Any odd cycle forces a vertex to be the same color as its neighbor. BFS/DFS 2-coloring detects this.' },
  { id:'gph-8', topic:'Graphs', difficulty:'Hard',   company:'Google',    question:"Kosaraju's SCC algorithm performs:", options:['One BFS pass','DFS on original graph + DFS on reversed graph in reverse finish-time order','Floyd-Warshall all-pairs','Union-Find on directed edges'], answer:1, explanation:"Step 1: DFS, record finish times. Step 2: transpose graph. Step 3: DFS in reverse finish-time order — each DFS tree is one SCC." },

  // ── Sorting ───────────────────────────────────────────────────────────────
  { id:'srt-1', topic:'Sorting', difficulty:'Medium', company:'Amazon',    question:'Quicksort degrades to O(n²) worst case when:', options:['Pivot is always the median','Array is already sorted and pivot is always first/last element','Array has all distinct elements','Partition splits array evenly'], answer:1, explanation:'Always picking min/max as pivot produces partitions of sizes 0 and n−1, yielding n recursive calls of diminishing size: T(n) = T(n−1) + O(n) → O(n²).' },
  { id:'srt-2', topic:'Sorting', difficulty:'Easy',   company:'Google',    question:'Which algorithm is always both stable AND O(n log n) worst case?', options:['Quicksort','Heapsort','Merge Sort','Introsort'], answer:2, explanation:"Merge sort guarantees O(n log n) in all cases and preserves relative order of equal elements (stable). Heapsort is O(n log n) but not stable; Quicksort isn't stable and can be O(n²)." },
  { id:'srt-3', topic:'Sorting', difficulty:'Medium', company:'Microsoft', question:'Heapsort achieves:', options:['O(n log n) time, O(n) space','O(n log n) time, O(1) space','O(n²) time, O(1) space','O(n) time, O(n) space'], answer:1, explanation:'Build max-heap in O(n); extract-max n times in O(log n) each = O(n log n). The heap is built in-place → O(1) extra space.' },
  { id:'srt-4', topic:'Sorting', difficulty:'Medium', company:'Meta',      question:'Counting Sort runs in O(n + k). It is efficient when:', options:['n is very large with floating-point values','k (range of values) is not much larger than n','The array is nearly sorted','Elements are strings'], answer:1, explanation:'When k = O(n), counting sort is O(n) — beating comparison-based O(n log n). Large k wastes both time and space.' },
  { id:'srt-5', topic:'Sorting', difficulty:'Hard',   company:'Apple',     question:'LSD Radix Sort (most common variant) processes digits:', options:['Most to least significant','Least to most significant using a stable sort each pass','Middle outward','Any order yields the same result'], answer:1, explanation:'LSD processes least significant digit first; each pass is a stable sort (counting sort). After d passes, array is sorted. Total: O(d·n).' },
  { id:'srt-6', topic:'Sorting', difficulty:'Easy',   company:'Uber',      question:"Python's sorted() / Java's Arrays.sort for objects uses:", options:['Quicksort','Merge Sort','TimSort (Merge Sort + Insertion Sort hybrid)','Heapsort'], answer:2, explanation:'TimSort detects already-sorted "runs" and merges them. Uses insertion sort for small arrays. O(n log n) worst case, O(n) best case (already sorted).' },
  { id:'srt-7', topic:'Sorting', difficulty:'Medium', company:'Netflix',   question:'Best algorithm for a nearly-sorted array of n elements:', options:['Quicksort','Heapsort','Merge Sort','Insertion Sort'], answer:3, explanation:'Insertion sort runs in O(n + inversions). A nearly-sorted array has very few inversions → close to O(n). This is why TimSort uses insertion sort for small/presorted runs.' },
];

// Study tips per topic (5 tips each, 2 random ones returned per session)
const STUDY_TIPS = {
  Arrays: [
    'Master the two-pointer pattern for sorted-array problems (Two Sum, Container with Most Water, 3Sum). It converts O(n²) brute force to O(n).',
    'Sliding window is your go-to for subarray/substring problems: fixed-size (max sum of k elements) and variable-size (smallest subarray with sum ≥ k).',
    'Prefix sums enable O(1) range-sum queries after O(n) preprocessing. Extend to 2D prefix sums for matrix range queries.',
    "Kadane's algorithm (max subarray sum) is the template for many DP-on-arrays problems. Know its recurrence cold.",
    'Dutch National Flag / 3-way partition appears in QuickSort\'s partition step and "Sort Colors" — practice until it\'s instinctive.',
  ],
  'Linked List': [
    "Floyd's Cycle Detection (fast/slow pointers) appears in top-10 phone-screen questions. Also memorize the step to find cycle start.",
    'The LRU Cache design (HashMap + DoublyLinkedList) is arguably the most-asked data-structure design question. Implement it from scratch.',
    'Linked list problems often need 1-2 dummy head nodes to simplify edge cases (empty list, single node, head removal).',
    'Two-pointer patterns: (1) N-apart pointers for Nth-from-end, (2) slow/fast for middle, (3) two heads for merge detection.',
    'Practice reversing sub-lists (Reverse Nodes in k-Group) — it combines reversal with pointer bookkeeping.',
  ],
  Stacks: [
    'Monotonic stack template solves: Next Greater Element, Stock Span, Daily Temperatures, Largest Rectangle — all in O(n). Memorize the pattern.',
    'MinStack with O(1) getMin: push (val, currentMin) pairs, or maintain a parallel min-stack. Know both approaches.',
    'Largest Rectangle in Histogram is a classic Hard that every FAANG candidate should solve without hints. Use monotonic stack.',
    'Expression parsing: know infix→postfix conversion (Shunting-Yard) and postfix evaluation. These appear in calculator design questions.',
    'When you see nested structures (brackets, recursive encoding), think two stacks or recursion. "Decode String" is the canonical example.',
  ],
  Trees: [
    'Drill all 4 traversals (inorder, preorder, postorder, level-order) both recursively and iteratively. Iterative inorder with stack is frequently asked.',
    'BST operations: validate (min/max bounds), serialize/deserialize, and kth-smallest (inorder counter) — all O(h) time.',
    'Trie is essential for string prefix problems: autocomplete, longest common prefix, word search II. Implement TrieNode with child map and isEnd flag.',
    'Tree DP pattern: most tree problems return multiple values per node (e.g., height + diameter update, maxPathSum). Practice this template.',
    'Know LCA: (1) simple recursive DFS O(n), (2) binary lifting O(n log n) preprocessing + O(log n) query for repeated LCA queries.',
  ],
  'Dynamic Programming': [
    'DP identification: overlapping subproblems + optimal substructure. If brute recursion recalculates the same state, add memoization.',
    'Learn the 5 classic 1D-DP problems first: Fibonacci, Climbing Stairs, House Robber, Coin Change, Longest Increasing Subsequence.',
    'For 2D DP (LCS, Edit Distance, Unique Paths), draw the table, fill base cases, then derive each cell from surrounding cells.',
    'Space optimization: if dp[i][j] depends only on the previous row, reduce from O(n·m) to O(m) by using a rolling 1D array (iterate right-to-left for 0/1 knapsack).',
    'Interval DP (Matrix Chain Multiplication, Burst Balloons) requires iterating over all lengths and split points. Time: O(n³), Space: O(n²).',
  ],
  Graphs: [
    'BFS for unweighted shortest path + level-by-level exploration. DFS for cycle detection, topological sort, and connected components.',
    "Dijkstra with a min-heap (priority queue): O((V + E) log V). Use for non-negative weighted graphs. Don't use for negative edges.",
    "Union-Find (with path compression + rank): the fastest way to detect cycles and answer connectivity queries. Master Kruskal's MST with it.",
    "Topological sort: use Kahn's algorithm (BFS in-degree) for iterative code. Detect cycles by checking if processed count < V.",
    'Practice SCC algorithms for directed graphs: Kosaraju\'s (two DFS passes) is conceptually clearest; Tarjan\'s (one DFS) is more efficient.',
  ],
  Sorting: [
    'Know the decision table: stability needed? → Merge or TimSort. In-place + fast average? → Quicksort. Guaranteed O(n log n) in-place? → Heapsort.',
    'Quicksort optimizations: (1) randomly shuffle before sorting to avoid O(n²) worst case, (2) 3-way partition for many duplicates.',
    'Non-comparison sorts beat O(n log n) when applicable: Counting Sort for small integer range, Radix Sort for fixed-width integers/strings.',
    'Nearly-sorted arrays: Insertion Sort (O(n + inversions)) and TimSort dominate. Avoid quicksort on nearly-sorted data with naive pivot.',
    'External sorting (data larger than RAM): multi-way merge sort. Chunks loaded into memory, sorted, then k-way merged using a min-heap.',
  ],
};

const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const { generateDSAQuestionsAI } = require('../utils/aiService');

// POST /api/dsa/generate
const generate = async (req, res) => {
  try {
    const { topic = 'Mixed', difficulty, count = 10, language } = req.body;

    // 1. Try Dynamic AI Question Generation (Local LLM or Cloud Gemini)
    let aiQuestions = null;
    try {
      aiQuestions = await generateDSAQuestionsAI({
        topic,
        difficulty: difficulty || 'Medium',
        count: Math.min(Number(count) || 10, 15),
        language: language || 'General'
      });
    } catch (aiErr) {
      console.warn("Dynamic AI DSA question generation skipped to curated pool:", aiErr.message);
    }

    if (aiQuestions && Array.isArray(aiQuestions) && aiQuestions.length > 0) {
      // Shuffle answer options for AI-generated questions
      const questions = aiQuestions.map(q => {
        const correctText = q.options[q.answer] || q.options[0];
        const shuffledOptions = shuffle([...q.options]);
        return {
          id: q.id,
          topic: q.topic,
          difficulty: q.difficulty,
          company: q.company,
          question: q.question,
          options: shuffledOptions,
          answer: shuffledOptions.indexOf(correctText),
          explanation: q.explanation,
        };
      });

      return res.json({
        success: true,
        source: 'ai',
        questions,
        meta: { topic, difficulty: difficulty || 'Mixed', language: language || 'General', total: questions.length },
      });
    }

    // 2. Curated offline question pool fallback
    const normalizedTopic = (topic || 'Mixed').trim().toLowerCase();
    let pool = normalizedTopic === 'mixed'
      ? [...QUESTIONS]
      : QUESTIONS.filter(q => q.topic.toLowerCase() === normalizedTopic || q.topic.toLowerCase().includes(normalizedTopic) || normalizedTopic.includes(q.topic.toLowerCase()));
    
    if (pool.length === 0) pool = [...QUESTIONS];

    if (difficulty && difficulty.toLowerCase() !== 'mixed') {
      const filtered = pool.filter(q => q.difficulty.toLowerCase() === difficulty.toLowerCase());
      if (filtered.length > 0) pool = filtered;
    }

    const selected = shuffle(pool).slice(0, Math.min(count, pool.length));

    // Shuffle answer options each session so positions can't be memorised
    const questions = selected.map(q => {
      const correctText = q.options[q.answer];
      const shuffledOptions = shuffle([...q.options]);
      return {
        id: q.id,
        topic: q.topic,
        difficulty: q.difficulty,
        company: q.company,
        question: q.question,
        options: shuffledOptions,
        answer: shuffledOptions.indexOf(correctText),
        explanation: q.explanation,
      };
    });

    return res.json({
      success: true,
      source: 'curated_bank',
      questions,
      meta: { topic, difficulty: difficulty || 'Mixed', language: language || 'General', total: questions.length, availableInPool: pool.length },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// POST /api/dsa/analyze
const analyze = (req, res) => {
  try {
    const { results } = req.body;
    if (!results || !Array.isArray(results)) {
      return res.status(400).json({ error: 'results array is required' });
    }

    const total = results.length;
    const correct = results.filter(r => r.correct && !r.skipped).length;
    const skipped = results.filter(r => r.skipped).length;
    const wrong = total - correct - skipped;
    const score = total > 0 ? Math.round((correct / total) * 100) : 0;

    // Topic-wise breakdown
    const topicMap = {};
    results.forEach(r => {
      if (!topicMap[r.topic]) topicMap[r.topic] = { total: 0, correct: 0 };
      topicMap[r.topic].total++;
      if (r.correct && !r.skipped) topicMap[r.topic].correct++;
    });

    const topicBreakdown = Object.entries(topicMap).map(([topic, stats]) => ({
      topic,
      total: stats.total,
      correct: stats.correct,
      score: Math.round((stats.correct / stats.total) * 100),
    }));

    const weakTopics = topicBreakdown.filter(t => t.score < 60).map(t => t.topic);

    // 2 random study tips from weak (or random) topics
    const tipTopics = weakTopics.length > 0 ? weakTopics : topicBreakdown.map(t => t.topic);
    const selected = shuffle(tipTopics).slice(0, 2);
    const studyTips = selected.flatMap(topic => {
      const tips = STUDY_TIPS[topic];
      return tips ? [shuffle(tips)[0]] : [];
    });

    return res.json({ success: true, score, total, correct, wrong, skipped, topicBreakdown, weakTopics, studyTips });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { generate, analyze };
